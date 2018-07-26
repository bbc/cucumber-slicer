const fs = require('fs');
const { cucumberSlicer } = require('./cucumber-slicer');
const mock = require('mock-fs');

const splitFeature = `Feature: Dashboard filters

Scenario: Language settings apply to published items
  Given the following users exist:
  | name   | email            | language |
  | joe    | joe@bbc.co.uk    | en-gb    |
  | jane   | jane@bbc.co.uk   | en-gb    |
  | pierre | pierre@bbc.co.uk | fr       |
  When "joe" saves a draft
  Then the draft is in English

@wip
Scenario Outline: Change default filters and verify the response
   Given I publish multiple assets
   When I click on dashboard icon
   And I verify the default filter values
   When I change the <showing>,<item by> and <from> filters
   Then I verify the assets in response
 Examples:
 | showing     |   item by     | from    |
 |  all    |   everyone    |   today   |
 | published|  everyone    |   today   |

`;

const noSplitFeature = `@dashboard @nosplit
Feature: Dashboard filters

Scenario: Language settings apply to published items
  Given the following users exist:
  | name   | email            | language |
  | joe    | joe@bbc.co.uk    | en-gb    |
  | jane   | jane@bbc.co.uk   | en-gb    |
  | pierre | pierre@bbc.co.uk | fr       |
  When "joe" saves a draft
  Then the draft is in English

@wip
Scenario Outline: Change default filters and verify the response
   Given I publish multiple assets
   When I click on dashboard icon
   And I verify the default filter values
   When I change the <showing>,<item by> and <from> filters
   Then I verify the assets in response
 Examples:
 | showing     |   item by     | from    |
 |  all    |   everyone    |   today   |
 | published|  everyone    |   today   |
`;

const outlineOnly = `Feature: Dashboard filters

@wip
Scenario Outline: Change default filters and verify the response
   Given I publish multiple assets
   When I click on dashboard icon
   And I verify the default filter values
   When I change the <showing>,<item by> and <from> filters
   Then I verify the assets in response
 Examples:
 | showing     |   item by     | from    |
 |  all    |   everyone    |   today   |
 | published|  everyone    |   today   |

`;

const simpleScenario = `Feature: Something

Scenario: Some feature
  Given something feature is available
  When I use that feature
  Then it works
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

beforeAll(() => {
  // workaround for https://github.com/facebook/jest/issues/5792
  console.log();
  mock({
    '/some/dir': {
      'splitFeature': {
        'splitFeature.feature': splitFeature,
      },
      'noSplitFeature': {
        'noSplitFeature.feature': noSplitFeature,
      },
      'outlineOnly': {
        'outlineOnly.feature': outlineOnly,
      },
      'simpleScenario': {
        'simpleScenario.feature': simpleScenario,
      },
      'unrecognizedType': {
        'unrecognizedType.feature': unrecognizedType,
      },
      'backgroundScenario': {
        'backgroundScenario.feature': backgroundScenario,
      },
      'backgroundWithMultipleScenarios': {
        'backgroundWithMultipleScenarios.feature': backgroundWithMultipleScenarios,
      },
    },
  });
});

afterAll(() => {
  mock.restore();
});


test('separates feature file into scenarios', () => {
  const result = cucumberSlicer(
    ['/some/dir/splitFeature/splitFeature.feature'],
    '/some/dir/split'
  );
  expect(result.length).toBe(2);
  expect(fs.readdirSync('/some/dir/split').length).toBe(2);
  for (let xx = 0; xx < result.length; ++xx) {
    let content = fs.readFileSync(result[xx], 'utf8');
    expect(content).toContain('Feature: Dashboard filters\n\n');
    expect(content).toContain('Scenario');
  }
});

test('does not split features with @nosplit tag', () => {
  const result = cucumberSlicer(
    ['/some/dir/noSplitFeature/noSplitFeature.feature'],
    '/some/dir/split'
  );
  expect(result.length).toBe(1);
  expect(fs.readdirSync('/some/dir/split/dashboard').length).toBe(1);
  let content = fs.readFileSync(result[0], 'utf8');
  expect(content).toContain('Scenario: Language settings apply to published items');
  expect(content).toContain('@wip\nScenario Outline: Change default filters and verify the response');
});

test('handles outline-only feature files', () => {
  const result = cucumberSlicer(
    ['/some/dir/outlineOnly/outlineOnly.feature'],
    '/some/dir/split/outline'
  );
  expect(result.length).toBe(1);
  expect(fs.readdirSync('/some/dir/split/outline').length).toBe(1);
  let content = fs.readFileSync(result[0], 'utf8');
  expect(content).not.toContain('Scenario: Language settings apply to published items');
  expect(content).toContain('@wip\nScenario Outline: Change default filters and verify the response');
});

test('handles simple scenario files', () => {
  const result = cucumberSlicer(
    ['/some/dir/simpleScenario/simpleScenario.feature'],
    '/some/dir/split/simple'
  );
  expect(result.length).toBe(1);
  expect(fs.readdirSync('/some/dir/split/simple').length).toBe(1);
  let content = fs.readFileSync(result[0], 'utf8');
  expect(content).toContain('Scenario: Some feature');
});

test('skips over unrecognized content', () => {
  const result = cucumberSlicer(
    ['/some/dir/unrecognizedType/unrecognizedType.feature'],
    '/some/dir/split/unrecognized'
  );
  expect(result.length).toBe(0);
  expect(fs.existsSync('/some/dir/split/unrecognized')).toBe(false);
});

test('skips files with background content, but no scenarios', () => {
  const result = cucumberSlicer(
    ['/some/dir/backgroundScenario/backgroundScenario.feature'],
    '/some/dir/split/background'
  );
  expect(result.length).toBe(0);
  expect(fs.existsSync('/some/dir/split/background')).toBe(false);
});

test('writes background content to each scenario', () => {
  const result = cucumberSlicer(
    ['/some/dir/backgroundWithMultipleScenarios/backgroundWithMultipleScenarios.feature'],
    '/some/dir/split/background2'
  );
  expect(result.length).toBe(2);
  expect(fs.existsSync('/some/dir/split/background2')).toBe(true);
  expect(fs.readdirSync('/some/dir/split/background2').length).toBe(2);
  for (let xx = 0; xx < result.length; ++xx) {
    let content = fs.readFileSync(result[xx], 'utf8');
    expect(content).toContain("Background: Some feature");
  }
});
