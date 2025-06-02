/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2546990583")

  // update field
  collection.fields.addAt(1, new Field({
    "cost": 0,
    "hidden": true,
    "id": "password901924565",
    "max": 0,
    "min": 32,
    "name": "password",
    "pattern": "",
    "presentable": false,
    "required": true,
    "system": true,
    "type": "password"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2546990583")

  // update field
  collection.fields.addAt(1, new Field({
    "cost": 0,
    "hidden": true,
    "id": "password901924565",
    "max": 0,
    "min": 20,
    "name": "password",
    "pattern": "",
    "presentable": false,
    "required": true,
    "system": true,
    "type": "password"
  }))

  return app.save(collection)
})
