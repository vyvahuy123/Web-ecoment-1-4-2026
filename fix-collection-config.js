const fs = require('fs');
const path = 'E:/CleanArchitecture/src/Infrastructure/Persistence/Configurations/CollectionConfiguration.cs';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
    `        builder.HasOne(cp => cp.Collection)
            .WithMany(c => c.Products)
            .HasForeignKey(cp => cp.CollectionId)
            .OnDelete(DeleteBehavior.Cascade);`,
    `        builder.HasOne(cp => cp.Collection)
            .WithMany(c => c.Products)
            .HasForeignKey(cp => cp.CollectionId)
            .OnDelete(DeleteBehavior.Cascade)
            .IsRequired(false);

        builder.HasQueryFilter(cp => !cp.Collection.IsDeleted);`
);

fs.writeFileSync(path, code, 'utf8');
console.log('Done');
