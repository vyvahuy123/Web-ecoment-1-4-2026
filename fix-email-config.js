const fs = require('fs');
const path = 'E:/CleanArchitecture/src/WebApi/appsettings.json';
let config = JSON.parse(fs.readFileSync(path, 'utf8'));

config.Email.DefaultFrom = "vy@gmail.com"; // thay bằng gmail của bạn
config.Email.Smtp.Username = "vy@gmail.com"; // thay bằng gmail của bạn
config.Email.Smtp.Password = "trja qncf emnn ddod";
config.App.Name = "INDIAS Store";
config.App.ClientUrl = "http://localhost:3000";

fs.writeFileSync(path, JSON.stringify(config, null, 2));
console.log('Done');
