# Contribution Guide

After cloning the project, install the dependencies:

```bash
$ npm install
```

Before starting your work, first ensure you're in the `master` branch and that you've pulled down the latest changes:

```bash
$ git checkout master
$ git pull
```

Next, create a new branch for your work, with an appropriate name for your change:

```bash
$ git checkout -b add-my-cool-new-feature
```

To run the test suite locally:

```bash
$ npm test
```

Note that the test suite needs to pass for your changes to be accepted, so it's worth running this locally during development and before committing.

### Committing

Once you've made the desired changes and you're ready to commit, first stage your local changes:

```bash
$ git add .
```

Before continuing, consider the scope of your changes according to [semantic versioning](http://semver.org), noting whether this is a breaking change, a feature release or a patch.

New versions are published automatically from [Travis CI](https://travis-ci.org) using [semantic-release](https://github.com/semantic-release/semantic-release). In order to automatically increment version numbers correctly, commit messages must follow the [conventional commit message format](https://github.com/marionebl/commitlint/tree/master/%40commitlint/config-conventional). If your commit includes a breaking change, be sure to prefix your commit body with `BREAKING CHANGE: `.

To make this process easier, we have a commit script (powered by [commitizen](https://github.com/commitizen/cz-cli)) to help guide you through the commit process:

```bash
$ npm run commit
```

Once you've committed your work, push your changes to a branch of the same name on GitHub:

```bash
$ git push --set-upstream origin add-my-cool-new-feature
```

Next, head over to this repo's GitHub page and create a new pull request from your branch. **Make sure your PR title matches your [conventional commit message](https://github.com/marionebl/commitlint/tree/master/%40commitlint/config-conventional).**

In order for your pull request to be accepted, the [Travis CI](https://travis-ci.org) build needs to pass, and **your work needs to be reviewed by other contributors.**

It's likely that you might need to make some changes for your work to be accepted, but don't take this personally! Ultimately, the aim is to make it feel like the codebase was written by a single person, but this takes a lot of work and constant review of each others' work.

### Merging

If you have write access to this repo, whether this is your own work or the work of an outside collaborator, the next step is to merge the changes through the GitHub UI. Always make sure that the commit message matches the title of the PR (it may have been edited!)

Once merged, thanks to semantic-release, the contents of the pull request will be automatically published!

🎨📦🚀
