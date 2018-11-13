let yaml = require('js-yaml');
let fs   = require('fs');

let fp   = '/media/catcuts/0001C44100083553/Documents/catcuts/project/vigserver/server/apps/hispro/data/initdata/hispro_domains.yaml'

let records = []

// Get document, or throw exception on error
try {
  let doc = yaml.safeLoad(fs.readFileSync(fp, 'utf8'));
  records = doc.records
} catch (e) {
  console.log(e);
}

for (let i = 0; i < records.length; i++) {
  let level_Indent = [
    " ├——",
    " |   ├——",
    " |   |    ├——",
    " |   |    |    ├——"
  ]
  let d = records[i]
  console.log(`(${d.name}|${d.id})`)

  function f(d, level=0) {
    if (!d.children) return
    for (let j = 0; j < d.children.length; j++) {
      let dc = d.children[j]
      console.log(`${level_Indent[level]}${dc.name}(${dc.resource})`)
      f(dc, level+1)
    }
  }

  f(d)
}