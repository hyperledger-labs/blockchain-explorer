
.. SPDX-License-Identifier: Apache-2.0


Setting up the development environment
--------------------------------------

Overview
~~~~~~~~

Hyperledger Explorer has been developed in Ubuntu, and macOS environments

Please follow the instructions for Ubuntu builds, below.

Prerequisites
~~~~~~~~~~~~~

-  `Git client <https://git-scm.com/downloads>`__
-  `Go <https://golang.org/dl>`__ - version 1.11.x
-  (macOS)
   `Xcode <https://itunes.apple.com/us/app/xcode/id497799835?mt=12>`__
   must be installed
-  `Docker <https://www.docker.com/get-docker>`__ - 17.06.2-ce or later
-  `Docker Compose <https://docs.docker.com/compose>`__ - 1.14.0 or later
-  `Pip <https://pip.pypa.io/en/stable/installing>`__
-  (macOS) you may need to install gnutar, as macOS comes with bsdtar
   as the default, but the build uses some gnutar flags. You can use
   Homebrew to install it as follows:

::

    brew install gnu-tar --with-default-names

::

    pip install --upgrade pip


Steps
~~~~~

Set your GOPATH
^^^^^^^^^^^^^^^

Make sure you have properly setup your Host's `GOPATH environment
variable <https://github.com/golang/go/wiki/GOPATH>`__. This allows for
both building within the Host and the VM.

In case you installed Go into a different location from the standard one
your Go distribution assumes, make sure that you also set `GOROOT
environment variable <https://golang.org/doc/install#install>`__.

Cloning the Hyperledger Explorer source
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Contribution Workflow
~~~~~~~~~~~~~~~~~~~~~~~
The documentation is maintained using a "*contributor workflow*" where everyone without exception
contributes changes proposals using "*pull-requests*".

This facilitates social contribution, easy testing, and peer review.

To contribute changes, use the following workflow:

* `Fork the repository <https://github.com/hyperledger/blockchain-explorer/fork>`__.
* Clone your fork to your computer.
* Create a topic branch and name it appropriately. Starting the branch name with the issue number is a good practice and a reminder to fix only one issue in a Pull-Request (PR).
* Make your changes, adhering to the documentation conventions described below. In general a commit serves a single purpose and diffs should be easily comprehensible. For this reason do not mix any formatting fixes or typo fixes with actual documentation changes.
* Commit your changes using a clear commit message.
* Test your changes locally before pushing to ensure that what you are proposing is not breaking another part of the doc.
* Push your changes to your remote fork (usually labeled as `origin`).
* Create a pull-request (PR) on the Hyperledger Explorer doc repository. If the PR addresses an existing Jira issue,include the issue number in the PR title in square brackets (for example, `[BE-234]`).
* Add labels to identify the type of your PR. _For example, if your PR fixes a bug, add the "bug" label.
* If the PR address an existing Jira issue, comment in the Jira issue with the PR number.
* Ensure your changes are reviewed. Select the reviewers you would like to review your PR. If you don't know who to choose, simply select the reviewers proposed by GitHub or leave blank and let us know on `Hyperledger Explorer chat <https://chat.hyperledger.org/channel/hyperledger-explorer>`__.
* Make any required changes on your contribution from the reviewers feedback. Make the changes, commit to your branch, and push to your remote fork.
* When your PR is validated, all tests passed and your branch has no conflicts with the target branch, you can "squash and merge" your PR and you're done.

Pull Requests
~~~~~~~~~~~~~~~~

The process described here has several goals:

* Maintain documentation quality
* Fix problems that are important to users
* Engage the community in working toward the best possible documentation
* Enable a sustainable system for maintainers to review contributions
* Further explanation on PR & commit messages can be found in this post: `How to Write a Git Commit Message <https://chris.beams.io/posts/git-commit/>`__.


Please follow these steps to have your contribution considered by the approvers:

* Ensure all commits have a Sign-off for DCO, as described in `DCO.md <https://github.com/hyperledger/blockchain-explorer/blob/master/DCO.md>`__.
* After you submit your pull request, verify that all `status checks <https://help.github.com/articles/about-status-checks/>`__ are passing.

While the prerequisites above must be satisfied prior to having your pull request reviewed, the reviewer(s)
may ask you to complete additional writing, or other changes before your pull request can be ultimately accepted.
All changes must be code reviewed. For non-approvers this is obvious, since you can't commit anyway. But even for approvers, we want all
changes to get at least one review, preferably (for non-trivial changes obligatorily) from someone who knows the areas the change touches.
For non-trivial changes we may want two reviewers. The primary reviewer will make this decision and nominate a second reviewer, if needed.
Except for trivial changes, PRs should not be committed until relevant parties (e.g. owners of the subsystem affected by the PR) have had a
reasonable chance to look at PR in their local business hours.

If an approver intends to be the primary reviewer of a PR they should set themselves as the assignee on GitHub and say so in a reply to the PR. Only the primary approver of a change should actually do the merge, except in rare cases (e.g. they are unavailable in a reasonable timeframe).

If a PR has gone 2 work days without an approver emerging, please ask on `Hyperledger Explorer Rocketchat <https://chat.hyperledger.org/channel/hyperledger-explorer>`__



.. Licensed under Creative Commons Attribution 4.0 International License
   https://creativecommons.org/licenses/by/4.0/
