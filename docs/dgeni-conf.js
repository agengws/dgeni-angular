// Canonical path provides a consistent path (i.e. always forward slashes) across different OSes
var path = require('canonical-path');
var Package = require('dgeni').Package;

// Define your ID templates
const idTemplates = [
  {
    docTypes: ['api', 'service'],
    idTemplate: 'api-${name}',
    getAliases: (doc) => [doc.name, doc.title]
  },
  {
    docTypes: ['component'],
    getId: (doc) => doc.path.replace(/\/+/g, '-'),
  }
];

module.exports = new Package('dgeni-example', [
  require('dgeni-packages/angularjs'),
  require('dgeni-packages/jsdoc'),
  require('dgeni-packages/nunjucks')
])

.config(function(log, readFilesProcessor, writeFilesProcessor) {
  log.level = 'info';

  readFilesProcessor.basePath = path.resolve(__dirname, '..');
  readFilesProcessor.sourceFiles = [
    { include: 'src/**/*.js', basePath: 'src' }
  ];

  writeFilesProcessor.outputFolder  = 'build';
})

.config(function(templateFinder, templateEngine) {
  // Nunjucks and Angular conflict in their template bindings so change the Nunjucks
  templateEngine.config.tags = {
    variableStart: '{$',
    variableEnd: '$}'
  };

  templateFinder.templateFolders
      .unshift(path.resolve(__dirname, 'templates'));

  templateFinder.templatePatterns = [
    '${ doc.template }',
    '${ doc.id }.${ doc.docType }.template.html',
    '${ doc.id }.template.html',
    '${ doc.docType }.template.html',
    'common.template.html'
  ];
})

.config(function(getLinkInfo) {
  getLinkInfo.relativeLinks = true;
})

// Add the computeIdsProcessor to the package
.config(function(processor) {
  processor.processors.push(computeIdsProcessor);
})

// Pass the ID templates to the computeIdsProcessor
.config(function(computeIdsProcessor) {
  computeIdsProcessor.idTemplates = idTemplates;
});
