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

```

## How it works

The cucumberSlicer goes through each of the feature files and creates
a separate file out of each scenario. If the feature file includes
feature-level tags or background steps, these will be reflected in the
individual scenario files.

If you don't want one or more of the feature files to be split, add
the tag `@nosplit` to the feature-level tags. All of the scenarios in
that file will be kept in the resulting generated one.

The function returns a list of the generated files, so they can be
removed later.

## Why?

Many test automation infrastructures, such as
[Browserstack](https://www.browserstack.com/) or [Sauce Labs](https://saucelabs.com/), run the feature files
in parallel. However, if you write Gherkin/cucumber files in the normal way, you'll have
several scenarios per feature. This means those scenarios are run
as a group. There are various ways to address this (see
[parallel-cucumber](https://github.com/simondean/parallel-cucumber-js),
for example). The easiest way we found was to just use cucumber in the
normal way and split the tests into individual scenarios when we
wanted to run them on Browserstack or similar environment. We get the
benefit of managing feature files in the way we are used to, with
scenarios grouped by major feature, while still getting reasonable
performance from automated tests.

You will need to write the scenarios so that they are capable of running
in parallel, which is tricky if your tests access a shared database.
The `@nosplit` tag allows you to run some of your scenarios sequentially.
