CONTRIBUTING
============

Thank you for your interest in contributing! Issues and pull requests are
welcome.

Before submitting a pull request
--------------------------------
Pull requests should start with an issue which clearly specifies the
problem. This allows for discussion about how best to approach the problem
before any code has been written, saving time and effort in the long run. During
this phase, the `discussion` label will be added to the issue.

If you are planning to submit a pull request, it is also a good idea to outline
how you will solve the issue, as other contributors can bring up problems you
may have overlooked and help you avoid potential pitfalls.

Only once an issue has the go-ahead from a maintainer should work start on a
pull request.

Ultimately, we want to ensure that pull requests can be accepted, and this early
discussion gives that the best chance of happening.

Code style and commit message format
------------------------------------
We use husky to run some pre-commit steps such as prettier and eslint for code
formatting, and git-commit-msg-linter to check the git commit message format.

The commit message format is [here][1].

Run `yarn prepare` in the repository's root directory to set up husky. When you
create a git commit, your code will be formatted and the commit message will be
checked.

[1]: https://github.com/legend80s/git-commit-msg-linter?tab=readme-ov-file#recommended-commit-message-format
