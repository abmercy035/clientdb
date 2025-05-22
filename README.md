# 📦 localclientdb

[![npm version](https://img.shields.io/npm/v/localclientdb.svg)](https://www.npmjs.com/package/localclientdb)
[![bundle size](https://badgen.net/bundlephobia/minzip/localclientdb)](https://bundlephobia.com/package/localclientdb)
[![CDN](https://img.shields.io/badge/CDN-unpkg-blue)](https://unpkg.com/localclientdb@beta/dist/localclientdb.umd.min.js)
[![TypeScript](https://badgen.net/badge/TS/Supported/blue?icon=typescript)](https://www.typescriptlang.org/)

A lightweight JavaScript/TypeScript library, that provides a schema-based, MongoDB-like API as client-side database built on top of [`localForage`](https://github.com/localForage/localForage). Supports IndexedDB, WebSQL, and LocalStorage with MongoDB-like collection methods and validation.

Perfect for local-first apps, prototypes, or apps with offline-first features.

---

## ✅ Features

* 📁 Collection System: Mimics MongoDB-style collection handling.

* 📄 CRUD operations: Insert, find, update, and delete documents
* ✅ Schema-Based Validation: Define Schema validation or collections and validate inserts by type and `required` checks
* 🔍 Query Support: Find documents with simple object queries.
* 🔧 Pluggable storage driver (IndexedDB, WebSQL, LocalStorage)
* ⚡ Simple ⚡ MongoDB-like chainable API, synchronous-looking API (Promise-based)
* 🧠 Works fully in the browser



---

## 📦 Installation

```bash
npm install localclientdb

```
### CDN (Vanilla JS)

```html

<script src="https://unpkg.com/localclientdb@beta/dist/localclientdb.umd.min.js"></script>

<!-- The UMD build exposes a global variable named LocalClientDB. -->

```
---

## 🛠️ Usage


## 📁 Project Structure
### Example set up within a typical react app.
#### NOTE: No constrain/limitation to struction and setup.

```
src/
├── schemas/																		# grouping schemas for collection
│   ├── note.schema.ts								# note schema	
├── localClientDB.config.ts			# config and init database
├── App.js/ts/jsx/tsx         # Main App file
├── otherFiles                # other files
├── otherFolder               # other folders
```

---

## 🧱 LocalClientDB API Overview

* `createCollection(name, schema)`
* `insertOne(collectionName, doc)` || `collectionName.insertOne(doc)`
* `find(collectionName, query)` || `collectionName.find(query)`
* `findOne(collectionName, query)` || `collectionName.findOne(query)`
* `updateOne(collectionName, query, updates)` || `collectionName.updateOne(query)`
* `deleteOne(collectionName, query)` || `collectionName.deleteOne(query)`
* `getAllDocs(collectionName)` || `collectionName.getAllDocs(query)`
* `dropCollection(collectionName)` || `collectionName.dropCollection(query)`

---

### 1. Import, config and Initialize for global usage

```ts
// localClientDB.config.ts		

import { localClientDB, driver } from "localclientdb";

// Optional: Set a specific driver
await localClientDB().setDriver(driver.INDEXEDDB);

// Connect (config)
const db = localClientDB();

db.connect({ name: 'NoteApp' })

// export database instance
export default db

```

### With CDN in Vanilla JS

```html

<script>
  const db = LocalClientDB.localClientDB();

  db.connect({ name: "localDB", storeName: "users" });

  const users = db.createCollection("users", {
    name: { type: "string", required: true },
    age: "number",
  });

  users.insertOne({ name: "Anna", age: 21 });
</script>

```
---

### 2. Create a Collection with a schema (for model)

```ts
//note.schema.ts			

// import db instance declare/create/init collection and collection schema.
import db from "./localClientlDB.config";

export const noteschema = {
	title: "string",
	content: "string",
	date: "string",
}


// name of collection = note (just like mongoose model)
export const noteSchema = db.createCollection("notes", noteschema)

```

---

### 3. Insert Data

```tsx

// App.tsx
// a simple use case inside of App.jsx
import { useState } from "react";
import { noteSchema } from "./schemas/note.schema";

const [notes, setNotes] = useState([])
const [note, setNote] = useState({ title: "", content: "", id: null })

  const createNote = async (data: typeof noteSchema) => {
    if (!data.title || !data.content) return;
      const newNote = await noteSchema.insertOne({
        ...data,
        date: new Date().toISOString(),
      });
      setNotes([...notes, newNote]);
    setNote({ title: "", content: "", id: null });
}

  const deleteNote = async (id : string) => {
   await noteSchema.deleteOne({ _id: id });
    setNotes(notes.filter(n => n._id !== id));
}
 
```

---

### 4. Query Data

```ts
const all = await users.getAllDocs();
const john = await users.findOne({ name: "John" });
const young = await users.find({ age: 22 });
```

---

### 5. Update & Delete

```ts
await users.updateOne({ name: "Lydia" }, { age: 23 });

await users.deleteOne({ name: "John" });
await users.deleteById("some_doc_id");
```

---

### 6. Drop Collection

```ts
await users.drop();
```

---

## 🔌 Drivers

You can use the following drivers:

```ts
import { driver } from "localclientdb";

await localClientDB().setDriver(driver.LOCALSTORAGE);
await localClientDB().setDriver(driver.WEBSQL);
await localClientDB().setDriver(driver.INDEXEDDB); // Default & recommended
// or if instance of localClientDB exist already in your config (localClientlDB.config.ts) 
// then you can call setDriver on the instance

import db from "./localClientlDB.config";

await db.setDriver(driver.INDEXEDDB);
 
```

---

## 🧪 Schema Validation

Each collection can have a schema definition:

```ts
const books = localClientDB().createCollection("books", {
  title: { type: "string", required: true },
  pages: "number", // shorthand for { type: "number" }
});
```

If validation fails, an error is thrown with details.

---

## 🧠 How It Works

* Uses `localForage` under the hood for consistent storage
* Documents are stored under `__docs` key in each collection
* Every document is assigned a unique `_id`

---

## 🤝 Contributing

1. Fork this repo
2. Create a branch: `git checkout -b feature-name`
3. Make your changes
4. Push and open a pull request!

Feel free to suggest improvements or report issues in the [GitHub Issues](https://github.com/abmercy035@gmail.com/localclientdb/issues).

---

## 📄 License

This project is licensed under the [MIT License](LICENSE)

---
