import localforage from "localforage";

type SchemaField = string | {
	type: string;
	required?: boolean;
};

type Schema = {
	[key: string]: SchemaField;
};
type Document = Record<string, unknown>;
type DocumentArray = Document[];

export interface StorageConfig {
	name: string;
	storeName?: string;
	driver?: string | string[];
}

let globalConfig: StorageConfig = {
	name: 'localclientdb',
	storeName: 'localclientdb_collection'
};

const collectionInstances: { [name: string]: LocalForage } = {};
const schemaDefinitions: { [name: string]: Schema } = {};

const validateAgainstSchema = (schema: Schema, doc: Record<string, unknown>) => {
	for (const key in schema) {
		const rule = schema[key];
		const type = typeof rule === "string" ? rule : rule.type;
		const required = typeof rule === "object" && rule.required;

		if (required && !(key in doc)) {
			throw new Error(`Missing required field "${key}"`);
		}

		if (key in doc && typeof doc[key] !== type) {
			throw new Error(`Expected "${key}" to be of type "${type}", got ${typeof doc[key]} — Value: ${JSON.stringify(doc[key])}`);
		}

	}
	return true;
};

const generateId = () => {
	const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	let id = `_id(`;
	for (let i = 0; i < 64; i++) {
		id += chars.charAt(Math.floor(Math.random() * chars.length));
	}
	id += ")"
	return id;
};


export const localClientDB = (config?: StorageConfig) => {
	if (config) localforage.config(config);

	return {
		setDriver: (driver: string | string[]) => localforage.setDriver(driver),

		connect: function (config: StorageConfig) {
			localforage.config(config);
			globalConfig = config;
			return this;
		},

		createCollection: (name: string, schema: Schema) => {
			const collection = localforage.createInstance({ name: globalConfig.name, storeName: name });
			collectionInstances[name] = collection;
			schemaDefinitions[name] = schema;

			const methods = {
				create: (doc: Record<string, unknown>) => localClientDB().insertOne(name, doc),
				insertOne: (doc: Record<string, unknown>) => localClientDB().insertOne(name, doc),
				insertMany: (docs: Record<string, unknown>[]) => localClientDB().insertMany(name, docs),
				find: (query?: Record<string, unknown>) => localClientDB().find(name, query),
				findOne: (query?: Record<string, unknown>) => localClientDB().findOne(name, query),
				updateOne: (query: Record<string, unknown>, updates: Record<string, unknown>) => localClientDB().updateOne(name, query, updates),
				deleteOne: (query: Record<string, unknown>) => localClientDB().deleteOne(name, query),
				getAllDocs: () => localClientDB().getAllDocs(name),
				drop: () => localClientDB().dropCollection(name),
				raw: collection, // localClientDB collection current instance/object
			};

			return methods;
		},

		insertOne: async (collectionName: string, doc: Record<string, unknown>) => {
			const collection = collectionInstances[collectionName];
			if (!collection) throw new Error("Collection not found");

			const schema = schemaDefinitions[collectionName];
			validateAgainstSchema(schema, doc);

			const id = generateId();
			const stored = await collection.getItem<DocumentArray>("__docs") || [];
			stored.push({ ...doc, _id: id });
			await collection.setItem("__docs", stored);
			return { ...doc, _id: id };
		},

		insertMany: async (collectionName: string, docs: Record<string, unknown>[]) => {
			const collection = collectionInstances[collectionName];
			if (!collection) throw new Error("Collection not found");

			const schema = schemaDefinitions[collectionName];
			try {
				const stored = await collection.getItem<DocumentArray>("__docs") || [];
				const toBeStored = []
				for (const doc of docs) {
					validateAgainstSchema(schema, doc)

					const start = performance.now();
					const id = generateId();
					const end = performance.now();
					console.log(`generateId() took ${end - start} ms`);
					toBeStored.push({ ...doc, _id: id });
				}
				await collection.setItem("__docs", [...stored, ...toBeStored]);
				return toBeStored
			}
			catch (err) {
				console.log(`Validation error from one of many docs ${err}`)
				throw err;
			}
		},

		find: async (collectionName: string, query: Record<string, unknown> = {}) => {
			const collection = collectionInstances[collectionName];
			if (!collection) throw new Error("Collection not found");

			const docs = await collection.getItem<DocumentArray>("__docs") || [];
			return docs.filter(doc => Object.entries(query).every(([k, v]) => doc[k] === v));
		},

		findOne: async (collectionName: string, query: Record<string, unknown> = {}) => {
			const results = await localClientDB().find(collectionName, query);
			return results[0] || null;
		},

		updateOne: async (collectionName: string, query: Record<string, unknown>, updates: Record<string, unknown>) => {
			const collection = collectionInstances[collectionName];
			if (!collection) throw new Error("Collection not found");

			const docs = await collection.getItem<DocumentArray>("__docs") || [];
			const index = docs.findIndex(doc => Object.entries(query).every(([k, v]) => doc[k] === v));
			if (index === -1) return null;

			const mergedDoc = { ...docs[index], ...updates };

			const schema = schemaDefinitions[collectionName];
			try {
				validateAgainstSchema(schema, mergedDoc);
			} catch (err) {
				console.error("Validation failed in updateOne:", err);
				throw err;
			}
			docs[index] = mergedDoc;
			await collection.setItem("__docs", docs);

			return docs[index];
		},

		deleteById: async (collectionName: string, id: unknown) => {
			const collection = collectionInstances[collectionName];
			if (!collection) throw new Error("Collection not found");

			const docs = await collection.getItem<DocumentArray>("__docs") || [];
			const index = docs.findIndex(doc => doc._id === id);
			if (index === -1) return null;

			const deleted = docs.splice(index, 1)[0];
			await collection.setItem("__docs", docs);
			return deleted;
		},

		deleteOne: async (collectionName: string, query: Record<string, unknown>) => {
			const collection = collectionInstances[collectionName];
			if (!collection) throw new Error("Collection not found");

			const docs = await collection.getItem<DocumentArray>("__docs") || [];
			const index = docs.findIndex(doc => Object.entries(query).every(([k, v]) => doc[k] === v));
			if (index === -1) return null;

			const deleted = docs.splice(index, 1)[0];
			await collection.setItem("__docs", docs);
			return deleted;
		},

		getAllDocs: async (collectionName: string) => {
			const collection = collectionInstances[collectionName];
			return await collection.getItem<DocumentArray>("__docs") || [];
		},

		dropCollection: async (collectionName: string) => {
			const collection = collectionInstances[collectionName];
			if (!collection) throw new Error("Collection not found");

			await collection.clear();
			delete collectionInstances[collectionName];
			delete schemaDefinitions[collectionName];
		},
	};
};
