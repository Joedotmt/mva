/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("_pb_users_auth_")

  // update collection data
  unmarshal({
    "otp": {
      "duration": 900,
      "enabled": true
    },
    "passwordAuth": {
      "enabled": false
    }
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("_pb_users_auth_")

  // update collection data
  unmarshal({
    "otp": {
      "duration": 180,
      "enabled": false
    },
    "passwordAuth": {
      "enabled": true
    }
  }, collection)

  return app.save(collection)
})
