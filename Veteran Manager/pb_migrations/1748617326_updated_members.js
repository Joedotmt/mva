/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3572739349")

  // update collection data
  unmarshal({
    "indexes": [
      "CREATE UNIQUE INDEX `idx_4eSrIQnF0O` ON `memberse` (`idCardNumber`)"
    ],
    "name": "memberse"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3572739349")

  // update collection data
  unmarshal({
    "indexes": [
      "CREATE UNIQUE INDEX `idx_4eSrIQnF0O` ON `members` (`idCardNumber`)"
    ],
    "name": "members"
  }, collection)

  return app.save(collection)
})
