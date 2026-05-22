const fs = require('fs');
const path = 'E:/CleanArchitecture/src/WebApi/appsettings.json';
let config = JSON.parse(fs.readFileSync(path, 'utf8'));

config.Email.DefaultFrom = "roghe2020@gmail.com";
config.Email.Smtp.Username = "roghe2020@gmail.com";
config.Email.Smtp.Password = "trja qncf emnn ddod";

fs.writeFileSync(path, JSON.stringify(config, null, 2));
console.log('Done');
