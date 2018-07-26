const fs = require('fs');
const { getAllFeatureFiles,
        removeGeneratedFiles,
        writeFeatureFile } = require('./feature-files');
const mock = require('mock-fs');

beforeAll(() => {
  mock({
    '/some/dir': {
      'one.feature': 'file content',
      'two.feature': 'file content',
      'core': {
        'another.feature': 'some more content',
        'yet-another.feature': 'some more content',
      },
      'browserTests': {
        'editor.feature': 'some editor content',
      },
      'extra': {
        'not-a-feature.txt': 'some non-feature content',
      },
      'empty': {},
    }
  });
});

afterAll(() => {
  mock.restore();
});

const testFeature= {
  feature: {
    tags: [],
  }
};

test('writes feature files to specified directory', () => {
  const result = writeFeatureFile('/some/dir/split', testFeature, 'some content');
  expect(result).toContain('/some/dir/split');
  expect(result).toContain('.feature');
});

test('uses first tag on feature files in path', () => {
  const feature = testFeature;
  feature.feature.tags.push({name: '@core'});
  const result = writeFeatureFile('/some/dir/split', feature, 'some content');
  expect(result).toContain('/some/dir/split/core');
  expect(result).toContain('.feature');
});
