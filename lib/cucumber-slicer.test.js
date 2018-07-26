const fs = require('fs');
const { cucumberSlicer } = require('./cucumber-slicer');
const mock = require('mock-fs');

const simpleMultipleScenarios = `Feature: Testing

Scenario: Some feature works
  Given a feature is enabled
  When I try to use the feature
  Then it works

Scenario: Some feature is disabled
  Given a feature is disabled
  When I try to use the feature
  Then it doesn't work
`;

const scenarioOutline = `Feature: Testing

Scenario Outline: a feature works
  Given I publish stuff
  When I change the <showing>, <item by> and <from> filters
  Then I can see the published stuff
Examples:
| showing | item by | from |
| all | everyone | today |
| published | everyone | today |
`;

const givenTable = `Feature: Testing

Scenario: Language settings apply to published items
  Given the following users exist:
  | name | email | language |
  | joe | joe@bbc.co.uk | en-gb |
  | jane | jane@bbc.co.uk | en-gb |
  | pierre | pierre@bbc.co.uk | fr |
  When "joe" saves a draft
  Then the draft is in English
`;

const givenAndOutline = `Feature: Testing

Scenario: Language settings apply to published items
  Given the following users exist:
  | name | email | language |
  | joe | joe@bbc.co.uk | en-gb |
  | jane | jane@bbc.co.uk | en-gb |
  | pierre | pierre@bbc.co.uk | fr |
  When "joe" saves a draft
  Then the draft is in English

Scenario Outline: a feature works
  Given I publish stuff
  When I change the <showing>, <item by> and <from> filters
  Then I can see the published stuff
Examples:
| showing | item by | from |
| all | everyone | today |
| published | everyone | today |
`;

const noSplit = `@nosplit
Feature: Testing

Scenario: Some feature works
  Given a feature is enabled
  When I try to use the feature
  Then it works

Scenario: Some feature is disabled
  Given a feature is disabled
  When I try to use the feature
  Then it doesn't work
`;

const unrecognizedType = `Feature: Something

Example: Some feature
  Given something feature is available
  When I use that feature
  Then it works
`;

const backgroundScenario = `Feature: Something

Background: Some feature
  Given something feature is available
`;

const backgroundWithMultipleScenarios = `Feature: Something

Background: Some feature
  Given something feature is available

Scenario: Testing some feature
  Given I wanna use a feature
  When I use the feature
  Then it works

Scenario: Testing some other feature
  Given I wanna use a feature
  When I try to use the feature
  Then I'm told it doesn't work

`;

const featureLevelTags = `@featureLevelTag
Feature: Something

Scenario: Something works
  Given something works
  When I try it
  Then it works

`;

const scenarioLevelTags = `Feature: Something

@wip
Scenario: Something works
  Given something works
  When I try it
  Then it works

`;

const bothKindsOfTag = `@featureLevelTag
Feature: Something

@wip @ignore
Scenario: Something works
  Given something works
  When I try it
  Then it works

`;

const notAFeatureFile = "This doesn't look at all like a feature file";

beforeAll(() => {
  // workaround for https://github.com/facebook/jest/issues/5792
  console.log();
  mock({
    '/some/dir': {
      'simpleMultipleScenarios': {
        'simpleMultipleScenarios.feature': simpleMultipleScenarios,
      },
      'scenarioOutline': {
        'scenarioOutline.feature': scenarioOutline,
      },
      'givenTable': {
        'givenTable.feature': givenTable,
      },
      'givenAndOutline': {
        'givenAndOutline.feature': givenAndOutline,
      },
      'noSplit': {
        'noSplit.feature': noSplit,
      },
      'unrecognizedType': {
        'unrecognizedType.feature': unrecognizedType,
      },
      'backgroundScenario': {
        'backgroundScenario.feature': backgroundScenario,
      },
      'backgroundWithMultipleScenarios' : {
        'backgroundWithMultipleScenarios.feature': backgroundWithMultipleScenarios,
      },
      'notAFeatureFile': {
        'notAFeatureFile.feature': notAFeatureFile,
      },
      'featureLevelTags': {
        'featureLevelTags.feature': featureLevelTags,
      },
      'scenarioLevelTags': {
        'scenarioLevelTags.feature': scenarioLevelTags,
      },
      'bothKindsOfTag': {
        'bothKindsOfTag.feature': bothKindsOfTag,
      },
      'multipleFeatureFiles': {
        'one.feature': backgroundWithMultipleScenarios,
        'two.feature': backgroundWithMultipleScenarios,
        'three.feature': backgroundWithMultipleScenarios,
      },
    },
  });
});

afterAll(() => {
  mock.restore();
});


test('separates feature file into scenarios', () => {
  const result = cucumberSlicer(
    ['/some/dir/simpleMultipleScenarios/simpleMultipleScenarios.feature'],
    '/some/dir/split'
  );
  expect(result.length).toBe(2);
  expect(fs.readdirSync('/some/dir/split').length).toBe(2);
  let first = fs.readFileSync(result[0], 'utf8');
  let second = fs.readFileSync(result[1], 'utf8');
  expect(first).toContain(
    "Scenario: Some feature works\n  Given a feature is enabled\n  When I try to use the feature\n  Then it works\n\n"
  );
  expect(second).toContain(
    "Scenario: Some feature is disabled\n  Given a feature is disabled\n  When I try to use the feature\n  Then it doesn't work\n\n"
  );
});

test('handles example outlines', () => {
  const result = cucumberSlicer(
    ['/some/dir/scenarioOutline/scenarioOutline.feature'],
    '/some/dir/split/outline'
  );
  expect(result.length).toBe(1);
  expect(fs.readdirSync('/some/dir/split/outline').length).toBe(1);
  let content = fs.readFileSync(result[0], 'utf8');
  expect(content).toContain(
    "Examples:\n | showing | item by | from |\n | all | everyone | today |\n | published | everyone | today |\n"
  );
});

test('handles given table', () => {
  const result = cucumberSlicer(
    ['/some/dir/givenTable/givenTable.feature'],
    '/some/dir/split/table'
  );
  expect(result.length).toBe(1);
  expect(fs.readdirSync('/some/dir/split/table').length).toBe(1);
  let content = fs.readFileSync(result[0], 'utf8');
  expect(content).toContain(
    "  Given the following users exist:\n  | name | email | language |\n"
  );
});

test('handles both types of tables in one feature', () => {
  const result = cucumberSlicer(
    ['/some/dir/givenAndOutline/givenAndOutline.feature'],
    '/some/dir/split/tables'
  );
  expect(result.length).toBe(2);
  expect(fs.readdirSync('/some/dir/split/tables').length).toBe(2);
  let first = fs.readFileSync(result[0], 'utf8');
  expect(first).toContain(
    "  Given the following users exist:\n  | name | email | language |\n"
  );
  let second = fs.readFileSync(result[1], 'utf8');
  expect(second).toContain(
    "Examples:\n | showing | item by | from |\n | all | everyone | today |\n | published | everyone | today |\n"
  );
});

test('does not split features with @nosplit tag', () => {
  const result = cucumberSlicer(
    ['/some/dir/noSplit/noSplit.feature'],
    '/some/dir/split'
  );
  expect(result.length).toBe(1);
  expect(fs.readdirSync('/some/dir/split/nosplit').length).toBe(1);
  let content = fs.readFileSync(result[0], 'utf8');
  expect(content).toContain('Scenario: Some feature works');
  expect(content).toContain('Scenario: Some feature is disabled');
});

test('handles unrecognized content', () => {
  const result = cucumberSlicer(
    ['/some/dir/unrecognizedType/unrecognizedType.feature'],
    '/some/dir/unrecognized'
  );
  expect(result.length).toBe(0);
  expect(fs.existsSync('/some/dir/unrecognized')).toBe(false);
});

test('outputs nothing with a feature that contains background and no scenarios', () => {
  const result = cucumberSlicer(
    ['/some/dir/backgroundScenario/backgroundScenario.feature'],
    '/some/dir/background'
  );
  expect(result.length).toBe(0);
  expect(fs.existsSync('/some/dir/background')).toBe(false);
});

test('copies background steps to each scenario file', () => {
  const result = cucumberSlicer(
    ['/some/dir/backgroundWithMultipleScenarios/backgroundWithMultipleScenarios.feature'],
    '/some/dir/background2'
  );
  expect(result.length).toBe(2);
  expect(fs.readdirSync('/some/dir/background2').length).toBe(2);
  result.forEach((file) => {
    expect(fs.readFileSync(file, 'utf8')).toContain("Background: Some feature");
  });
});

test('throw exception on malformed feature', () => {
  expect(() => {
    cucumberSlicer(
      ['/some/dir/notAFeatureFile/notAFeatureFile.feature'],
      '/some/dir/notASplit'
    );
  }).toThrow();
});

test('throw exception if given non-existent file', async () => {
  expect(() => {
    cucumberSlicer(
      ['/some/dir/does-not-exist/something.feature'],
      '/some/dir/notASplit'
    );
  }).toThrow();
});

test('picks up feature-level tags', () => {
  const result = cucumberSlicer(
    ['/some/dir/featureLevelTags/featureLevelTags.feature'],
    '/some/dir/featureTag'
  );
  expect(result.length).toBe(1);
  let content = fs.readFileSync(result[0], 'utf8');
  expect(content).toContain('@featureLevelTag\nFeature: Something');
});

test('picks up scenario-level tags', () => {
  const result = cucumberSlicer(
    ['/some/dir/scenarioLevelTags/scenarioLevelTags.feature'],
    '/some/dir/scenarioTag'
  );
  expect(result.length).toBe(1);
  let content = fs.readFileSync(result[0], 'utf8');
  expect(content).toContain('@wip\nScenario: Something works');
});

test('picks up both kinds of tags', () => {
  const result = cucumberSlicer(
    ['/some/dir/bothKindsOfTag/bothKindsOfTag.feature'],
    '/some/dir/twoTags'
  );
  expect(result.length).toBe(1);
  let content = fs.readFileSync(result[0], 'utf8');
  expect(content).toContain('@featureLevelTag\nFeature: Something');
  expect(content).toContain('@wip @ignore\nScenario: Something works');
});

test('handles multiple files', async () => {
  const result = cucumberSlicer(
    [
      '/some/dir/multipleFeatureFiles/one.feature',
      '/some/dir/multipleFeatureFiles/two.feature',
      '/some/dir/multipleFeatureFiles/three.feature',
    ],
    '/some/dir/split/multiple'
  );
  expect(result.length).toBe(6);
  expect(fs.existsSync('/some/dir/split/multiple')).toBe(true);
  expect(fs.readdirSync('/some/dir/split/multiple').length).toBe(6);
  for (let xx = 0; xx < result.length; ++xx) {
    let content = fs.readFileSync(result[xx], 'utf8');
    expect(content).toContain("Background: Some feature");
  }
});
