const {
  extractTags,
  extractScenarios,
  getScenariosOfType,
  getFeatureTop,
} = require('../lib/features');

const testScenarios = [
  {
    type: 'Background',
    tags: [],
    name: 'some pre-condition',
    steps: [
      {
        keyword: "Given",
        text: "A user exists with default settings",
      }
    ],
  },
  {
    type: 'Scenario',
    tags: [{name: '@wip'}],
    name: "something works",
    steps: [
      {
        keyword: "Given",
        text: "some feature is enabled"
      },
      {
        keyword: "When",
        text: "I try to use the feature"
      },
      {
        keyword: "Then",
        text: "it works"
      },
    ],
  },
  {
    type: 'Scenario',
    tags: [],
    name: "something else works",
    steps: [
      {
        keyword: "Given",
        text: "some other feature is enabled"
      },
      {
        keyword: "When",
        text: "I try to use this other feature"
      },
      {
        keyword: "Then",
        text: "it works"
      },
    ],
  },
];

test('extracts multiple tags', () => {
  const tags = [];
  tags.push({name: '@core'});
  tags.push({name: '@nosplit'});
  const result = extractTags(tags);
  expect(result).toContain('@core @nosplit');
});

test("Returns an empty string when there aren't any tags", () => {
  const result = extractTags([]);
  expect(result).toBe('');
});

test('extracts multiple scenarios', () => {
  const result = extractScenarios(testScenarios);
  const expected = `Background: some pre-condition
  Given A user exists with default settings

@wip
Scenario: something works
  Given some feature is enabled
  When I try to use the feature
  Then it works

Scenario: something else works
  Given some other feature is enabled
  When I try to use this other feature
  Then it works

`;
  expect(result).toEqual(expected);
});

test('finds types of scenarios', () => {
  const fullDoc = {
    feature: {
      children: testScenarios,
    }
  };
  const background = getScenariosOfType(fullDoc, "Background");
  expect(background.length).toBe(1);
  const scenarios = getScenariosOfType(fullDoc, "Scenario");
  expect(scenarios.length).toBe(2);
});

test('generate the top of a file, with tags and background', () => {
  const fullDoc = {
    feature: {
      tags: [{name: '@someFeature'}],
      name: 'A feature file',
      children: testScenarios,
    }
  };
  const result = getFeatureTop(fullDoc);
  const expected = `@someFeature
Feature: A feature file

Background: some pre-condition
  Given A user exists with default settings

`;
  expect(result).toEqual(expected);
});

test('generate the top of a file with no feature-level tags', () => {
  const fullDoc = {
    feature: {
      tags: [],
      name: 'A feature file',
      children: testScenarios,
    }
  };
  const result = getFeatureTop(fullDoc);
  const expected = `Feature: A feature file

Background: some pre-condition
  Given A user exists with default settings

`;
  expect(result).toEqual(expected);

});

test('generate the top of a file with no feature-level tags or background', () => {
  const fullDoc = {
    feature: {
      tags: [],
      name: 'A feature file',
      children: testScenarios,
    }
  };
  fullDoc.feature.children = getScenariosOfType(fullDoc, "Scenario");
  const result = getFeatureTop(fullDoc);
  const expected = `Feature: A feature file

`;
  expect(result).toEqual(expected);

});


test('extract example tables in scenarios', () => {
  let scenarioOutline = {
    "examples": [
      {
        "tableBody": [
          {
            "cells": [
              {
                "value": "all",
                "location": {
                  "column": 5,
                  "line": 22
                },
                "type": "TableCell"
              },
              {
                "value": "everyone",
                "location": {
                  "column": 16,
                  "line": 22
                },
                "type": "TableCell"
              },
              {
                "value": "today",
                "location": {
                  "column": 32,
                  "line": 22
                },
                "type": "TableCell"
              }
            ],
            "location": {
              "column": 2,
              "line": 22
            },
            "type": "TableRow"
          },
          {
            "cells": [
              {
                "value": "published",
                "location": {
                  "column": 4,
                  "line": 23
                },
                "type": "TableCell"
              },
              {
                "value": "everyone",
                "location": {
                  "column": 16,
                  "line": 23
                },
                "type": "TableCell"
              },
              {
                "value": "today",
                "location": {
                  "column": 32,
                  "line": 23
                },
                "type": "TableCell"
              }
            ],
            "location": {
              "column": 2,
              "line": 23
            },
            "type": "TableRow"
          }
        ],
        "tableHeader": {
          "cells": [
            {
              "value": "showing",
              "location": {
                "column": 4,
                "line": 21
              },
              "type": "TableCell"
            },
            {
              "value": "item by",
              "location": {
                "column": 20,
                "line": 21
              },
              "type": "TableCell"
            },
            {
              "value": "from",
              "location": {
                "column": 34,
                "line": 21
              },
              "type": "TableCell"
            }
          ],
          "location": {
            "column": 2,
            "line": 21
          },
          "type": "TableRow"
        },
        "name": "",
        "keyword": "Examples",
        "location": {
          "column": 2,
          "line": 20
        },
        "tags": [],
        "type": "Examples"
      }
    ],
    "steps": [
      {
        "text": "I publish multiple assets",
        "keyword": "Given ",
        "location": {
          "column": 4,
          "line": 15
        },
        "type": "Step"
      },
      {
        "text": "I click on dashboard icon",
        "keyword": "When ",
        "location": {
          "column": 4,
          "line": 16
        },
        "type": "Step"
      },
      {
        "text": "I verify the default filter values",
        "keyword": "And ",
        "location": {
          "column": 4,
          "line": 17
        },
        "type": "Step"
      },
      {
        "text": "I change the <showing>,<item by> and <from> filters",
        "keyword": "When ",
        "location": {
          "column": 4,
          "line": 18
        },
        "type": "Step"
      },
      {
        "text": "I verify the assets in response",
        "keyword": "Then ",
        "location": {
          "column": 4,
          "line": 19
        },
        "type": "Step"
      }
    ],
    "name": "Change default filters and verify the response",
    "keyword": "Scenario Outline",
    "location": {
      "column": 1,
      "line": 14
    },
    "tags": [
      {
        "name": "@wip",
        "location": {
          "column": 1,
          "line": 13
        },
        "type": "Tag"
      }
    ],
    "type": "ScenarioOutline"
  };

  const result = extractScenarios([scenarioOutline]);
  const expected = `@wip
Scenario Outline: Change default filters and verify the response
  Given I publish multiple assets
  When I click on dashboard icon
  And I verify the default filter values
  When I change the <showing>,<item by> and <from> filters
  Then I verify the assets in response
Examples:
 | showing | item by | from |
 | all | everyone | today |
 | published | everyone | today |

`;
  expect(result).toEqual(expected);
});

test('extracts argument tables in steps', () => {
  let scenarioWithArgument = [
      {
        "steps": [
          {
            "argument": {
              "rows": [
                {
                  "cells": [
                    {
                      "value": "name",
                      "location": {
                        "column": 5,
                        "line": 6
                      },
                      "type": "TableCell"
                    },
                    {
                      "value": "email",
                      "location": {
                        "column": 14,
                        "line": 6
                      },
                      "type": "TableCell"
                    },
                    {
                      "value": "language",
                      "location": {
                        "column": 33,
                        "line": 6
                      },
                      "type": "TableCell"
                    }
                  ],
                  "location": {
                    "column": 3,
                    "line": 6
                  },
                  "type": "TableRow"
                },
                {
                  "cells": [
                    {
                      "value": "joe",
                      "location": {
                        "column": 5,
                        "line": 7
                      },
                      "type": "TableCell"
                    },
                    {
                      "value": "joe@bbc.co.uk",
                      "location": {
                        "column": 14,
                        "line": 7
                      },
                      "type": "TableCell"
                    },
                    {
                      "value": "en-gb",
                      "location": {
                        "column": 33,
                        "line": 7
                      },
                      "type": "TableCell"
                    }
                  ],
                  "location": {
                    "column": 3,
                    "line": 7
                  },
                  "type": "TableRow"
                },
                {
                  "cells": [
                    {
                      "value": "jane",
                      "location": {
                        "column": 5,
                        "line": 8
                      },
                      "type": "TableCell"
                    },
                    {
                      "value": "jane@bbc.co.uk",
                      "location": {
                        "column": 14,
                        "line": 8
                      },
                      "type": "TableCell"
                    },
                    {
                      "value": "en-gb",
                      "location": {
                        "column": 33,
                        "line": 8
                      },
                      "type": "TableCell"
                    }
                  ],
                  "location": {
                    "column": 3,
                    "line": 8
                  },
                  "type": "TableRow"
                },
                {
                  "cells": [
                    {
                      "value": "pierre",
                      "location": {
                        "column": 5,
                        "line": 9
                      },
                      "type": "TableCell"
                    },
                    {
                      "value": "pierre@bbc.co.uk",
                      "location": {
                        "column": 14,
                        "line": 9
                      },
                      "type": "TableCell"
                    },
                    {
                      "value": "fr",
                      "location": {
                        "column": 33,
                        "line": 9
                      },
                      "type": "TableCell"
                    }
                  ],
                  "location": {
                    "column": 3,
                    "line": 9
                  },
                  "type": "TableRow"
                }
              ],
              "location": {
                "column": 3,
                "line": 6
              },
              "type": "DataTable"
            },
            "text": "the following users exist:",
            "keyword": "Given ",
            "location": {
              "column": 3,
              "line": 5
            },
            "type": "Step"
          },
          {
            "text": "\"joe\" saves a draft",
            "keyword": "When ",
            "location": {
              "column": 3,
              "line": 10
            },
            "type": "Step"
          },
          {
            "text": "the draft is in English",
            "keyword": "Then ",
            "location": {
              "column": 3,
              "line": 11
            },
            "type": "Step"
          }
        ],
        "name": "Language settings apply to published items",
        "keyword": "Scenario",
        "location": {
          "column": 1,
          "line": 4
        },
        "tags": [],
        "type": "Scenario"
      }
  ];
  const result = extractScenarios(scenarioWithArgument);
  const expected = `Scenario: Language settings apply to published items
  Given the following users exist:
  | name | email | language |
  | joe | joe@bbc.co.uk | en-gb |
  | jane | jane@bbc.co.uk | en-gb |
  | pierre | pierre@bbc.co.uk | fr |
  When "joe" saves a draft
  Then the draft is in English

`;
  expect(result).toEqual(expected);
});
