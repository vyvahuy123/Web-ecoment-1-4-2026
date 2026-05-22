const fs = require('fs');
const path = 'E:/CleanArchitecture/src/WebApi/appsettings.json';
let config = JSON.parse(fs.readFileSync(path, 'utf8'));

config.Email.DefaultFrom = "vyva2004@gmail.com";
config.Email.Smtp.Username = "vyva2004@gmail.com";
config.Email.Smtp.Password = "trja qncf emnn ddod";

fs.writeFileSync(path, JSON.stringify(config, null, 2));
console.log('Done');
