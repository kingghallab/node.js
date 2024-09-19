const path = require("path");

// USE THIS
module.exports = path.dirname(require.main.filename);



// THIS CODE DOESN'T WORK as mainModule is deprecated (outdated)
// module.exports = path.dirname(process.mainModule.filename);