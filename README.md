# cucumber-slicer
Split cucumber feature files into a separate file for each scenario.

## Installation

``` shell
npm install @bbc/cucumber-slicer --save
```

## Usage

``` javascript
const glob = require('glob');
const cucumberSlicer = require('@bbc/cucumber-slicer');

const featureFiles = glob.sync('./features/**/*.feature');
const generatedFiles = cucumberSlicer(featureFiles,
'./generatedFeatures');

runCucumberTests('./generatedFeatures/**/*.feature').then(() => {
  removeGeneratedFeatures(generatedFiles);
});

```

## How it works

The cucumberSlicer goes through each of the feature files and creates
a separate file out of each scenario. The generated files are meant to
be transient. They only include what is necessary to run the test --
no comments or extra explanatory text. What is copied over are any
feature-level tags, the feature title, any background steps, any
scenario-level tags (e.g., @wip) and the scenario with all of its
steps or table data.

To avoid creating too many files in a directory, the generator uses
the first feature-level tag (if any) as a subdirectory name.

If you don't want one or more of the feature files to be split, add
the tag `@nosplit` to the feature-level tags. All of the scenarios in
that file will be kept in the resulting generated one.


## Why?

Many test automation infrastructures, such as
[Browserstack](https://www.browserstack.com/) or [Sauce Labs](https://saucelabs.com/), run the feature files
in parallel. However, if you write Gherkin/cucumber files in the normal way, you'll have
several scenarios per feature. This means those scenarios are run
as a group. There are various ways to address this (see
[parallel-cucumber](https://github.com/simondean/parallel-cucumber-js),
for example). The easiest way we found -- without having to change any
of our other tools -- was to use cucumber in the
normal way and split the tests into individual scenarios when we
wanted to run them on Browserstack or similar environment. We get the
benefit of managing feature files in the way we are used to, with
scenarios grouped by major feature, while still getting reasonable
performance from automated tests.

You will need to write the scenarios so that they are capable of running
in parallel, which is tricky if your tests access a shared database.
The `@nosplit` tag allows you to run some of your scenarios sequentially.
