# deps-matrix

[deps-matrix](https://deps-matrix.pablodinella.com/) lets you visualize and understand which repositories share the same dependencies, and what version each one uses.

If you work with microservices (deps-matrix only supports nodejs services at the moment), you might want to know how updated your services are, which needs an update, and what is the most recent version of some dependency.

Simply [install](https://github.com/apps/deps-matrix/installations/new) deps-matrix in any organization you have access to in order to visualize the dependency matrix.

Example:

![screenshot](https://github.com/PabloDinella/deps-matrix/assets/2482730/f3319958-7980-4443-a1fb-3d69555350bc)

## Security

This app is completely stateless, we don't store any tokens or other data. The GitHub App oauth token used to read the repos in your organization is encrypted with AES encryption, so the token present in the URL while you use deps-matrix can only be decrypted in our server, and cannot be used by anyone else to read your repositories.
