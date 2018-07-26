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
