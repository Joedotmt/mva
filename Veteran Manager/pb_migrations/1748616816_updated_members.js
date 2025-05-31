/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3572739349")

  // update field
  collection.fields.addAt(10, new Field({
    "hidden": false,
    "id": "date3388494890",
    "max": "",
    "min": "",
    "name": "applicationDate",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "date"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3572739349")

  // update field
  collection.fields.addAt(10, new Field({
    "hidden": false,
    "id": "date3388494890",
    "max": "",
    "min": "",
    "name": "applicationDate",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "date"
  }))

  return app.save(collection)
})
