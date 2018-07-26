const fs = require('fs');
const Gherkin = require('gherkin');
const { writeFeatureFile } = require('./feature-files');
const { extractScenarios,
        getScenariosOfType,
        getFeatureTop } = require('./features');


function writeSingleScenarioFile(dir, parsed, scenario) {
  let output = getFeatureTop(parsed);
  output += extractScenarios(scenario);
  return writeFeatureFile(dir, parsed, output);
}

function writeWholeFeatureFile(dir, parsedFeature) {
  let output = getFeatureTop(parsedFeature);
  let scenarios = getScenariosOfType(parsedFeature, 'Scenario');
  scenarios = scenarios.concat(getScenariosOfType(parsedFeature, 'ScenarioOutline'));
  output += extractScenarios(scenarios);
  return writeFeatureFile(dir, parsedFeature, output);
}

function splitFeatureFile(parsed, dir) {
  let featureLevelTags = parsed.feature.tags;

  const containsNoSplitTag = (item) => (item.name.toLowerCase() === "@nosplit");
  if (featureLevelTags && featureLevelTags.some(containsNoSplitTag)) {
    // don't split this one into individual scenarios
    return [writeWholeFeatureFile(dir, parsed)];
  }

  return parsed.feature.children.filter((child) => {
    return child.type === "Scenario" || child.type === "ScenarioOutline";
  }).map((child) => {
    return writeSingleScenarioFile(dir, parsed, [child]);
  });
}

function cucumberSlicer(featureFiles, splitDir) {
  const parser = new Gherkin.Parser();
  let generatedFiles = [];
  featureFiles.forEach((file) => {
    generatedFiles = generatedFiles.concat(
      splitFeatureFile(
        parser.parse(fs.readFileSync(file, 'utf8')),
        splitDir)
    );
  });
  return generatedFiles;
}

module.exports = {
  cucumberSlicer,
};
