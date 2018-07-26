function extractTags(tags) {
  let result = ''
  let tagNames = tags.map((tag) => {
    return tag.name;
  });
  if (tagNames.length) {
    result = tagNames.join(' ') + '\n';
  }
  return result;
}

function extractExample(table) {
  let result = '';
  let header = table.tableHeader;
  let header_cells = header.cells.map((cell) => {
    return cell.value;
  });
  result += ' | ' + header_cells.join(' | ') + ' |\n';
  let body = table.tableBody;
  let rows = body.map((row) => {
    let values = row.cells.map((cell) => {
      return cell.value;
    });
    return ' | ' + values.join(' | ') + ' |\n';
  });
  result += rows.join('');
  return result;
}

function extractDataTableArgument(argument) {
  if (!argument) return '';

  let rows = argument.rows.map((row) => {
    let values = row.cells.map((cell) => {
      return cell.value;
    });
    return '  | ' + values.join(' | ') + ' |\n';
  });
  return rows.join('');
}

function extractScenarios(scenarios) {
  let result = '';
  scenarios.forEach((scenario) => {
    let child = scenario;
    if (child.tags && child.tags.length) {
      result += extractTags(child.tags);
    }
    let keyword = child.keyword ? child.keyword : child.type;
    result += keyword + ': ' + child.name + '\n';
    const steps = child.steps;
    for (let step = 0; step < steps.length; step++) {
      result += '  ' + steps[step].keyword.trim() + ' ' + steps[step].text.trim() + '\n';
      result += extractDataTableArgument(steps[step].argument);
    }
    const examples = child.examples ? child.examples : [];
    for (let eg = 0; eg < examples.length; eg++) {
      result += "Examples:\n";
      result += extractExample(examples[eg]);
    }
    result += '\n';
  });
  return result;
}

function getScenariosOfType(parsed, type) {
  return parsed.feature.children.filter((child) => {
    return child.type === type;
  });
}

function getFeatureTop(parsed) {
  let featureLevelTags = parsed.feature.tags;
  let featureTitle = parsed.feature.name;
  let background = getScenariosOfType(parsed, "Background");
  let output = '';
  if (featureLevelTags.length) {
    output += extractTags(featureLevelTags);
  }
  output += 'Feature: ' + featureTitle + '\n\n';
  if (background.length) {
    output += extractScenarios(background);
  }
  return output;
}

module.exports = {
  extractTags,
  extractScenarios,
  getScenariosOfType,
  getFeatureTop,
};
