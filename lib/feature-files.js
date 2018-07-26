const fs = require('fs');
const path = require('path');
const uuid = require('uuid/v4');

function writeFeatureFile(dir, parsed, content) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
  let featureTags = parsed.feature.tags;
  let directory = dir + (featureTags.length ? '/' + featureTags[0].name.toLowerCase().slice(1) + '/' : '/');
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory);
  }
  let filename = directory + uuid() + '.feature';
  fs.writeFileSync(filename, content);
  return filename;
}

module.exports = {
  writeFeatureFile,
};
