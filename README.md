[![Build Status](https://app.travis-ci.com/wozjac/omg-odata-mock-generator.svg?branch=main)](https://app.travis-ci.com/wozjac/omg-odata-mock-generator)
[![Coverage Status](https://coveralls.io/repos/github/wozjac/vscode-ui5-odata-mock-generator/badge.svg?branch=main)](https://coveralls.io/github/wozjac/vscode-ui5-odata-mock-generator?branch=main)

# VSCode-UI5: OData Mock Generator

_From version 1.0.1 - please migrate the settings to the ones prefixed with "Odata Mock Generator"._
_The old ones will be removed in the next version._

VSCode extension - an OData mock data files generator on steroids.  
Generates JSON mock data files based on the provided OData metadata.
Uses [OData Mock Generator](https://github.com/wozjac/omg-odata-mock-generator) under the hood,
which is based on [OpenUI5 Mock Server](https://openui5.hana.ondemand.com/api/sap.ui.core.util.MockServer)

Please check the sample use case here: <https://jacekw.dev/blog/sdn/enhanced-odata-mocks-ui5>

## Features

- use faker.js API methods for data generation
- generate specific number of entities for given entity sets
- skip generation of Entity Sets you don't need
- provide sets of values, which should be used instead of pure random values
- more meaningful and related data - values from one property can have a specific value
  based on a value from another property, which helps with building navigations
- force to have only distinct entries within an Entity Set (based on key properties)

## Installation

Search & install the extension via VSCode Extensions.

## How it works

After installation a new command is available:
![mock files](https://publicrepo.vipserv.org/images/vscode-mock/command.png)

By default, the generator will look for a service metadata XML file in the project's root path _webapp/
localService/metadata.xml_ and create mock data files in the _webapp/localService/mockdata_ folder.
The path can be changed with the setting `metadataPath`. It can also be a URL to metadata,
for example, <https://services.odata.org/V3/OData/OData.svc/$metadata>. The path for mock data
files is set via `mockDataTargetDirectory`.

For the [Northwind test service](https://services.odata.org/V3/OData/OData.svc/$metadata):
![mock files](https://publicrepo.vipserv.org/images/vscode-mock/mock-files.png)

By default each file has 30 entries (this is adjustable by the setting `defaultLengthOfEntitySets`)
and new files will overwrite old ones (change this with `overwriteExistingMockFiles`).
The length of data set can be also adjusted per entity set by using
using .rules.json file (explained later).

The default root URI is an empty string, it can be changed by setting `mockDataRootURI`: "myURI".

## Configure mock data generation

Additional options influencing data generation can be specified in _.rules.json_ file.
This file is by default searched in the project root, but it can be changed using setting
`mockRulesConfigFilePath`. The JSON provided in this file corresponds to the
[_rules_ property](https://wozjac.github.io/omg-odata-mock-generator/ODataMockGenerator.html).

Below examples are based on the metadata from <https://sapes5.sapdevcenter.com/sap/opu/odata/sap/ZSOCDS_SRV>

### Skipping mock data generation for entity sets

If you don't want to generate files for given entity sets, because we prefer to have our
own ones, then by using _"skipMockGeneration"_: [_EntitySetName1_,_EntitySetName2_]
mock data generation will be skipped for them.

For example:

```javascript
{
  "skipMockGeneration": ["SEPM_I_SalesOrderItem_E"]
}
```

### Setting number of generated entities

_defaultLengthOfEntitySets_ settings sets the default number of generated entries;
this can be overwritten for a specific entity sets using _rules.lengthOf_ option.

Setting generation of 2 entries for Products, 12 for Categories:

```javascript
{
  lengthOf: {
    Products: 2,
    Categories: 12
  }
}
```

### Using faker.js

Faker.js [API methods](https://marak.github.io/faker.js/#toc5__anchor) can be provided
and they will be used instead of default logic for data generation.
Alternatively, Mustache-like string with several values can be also passed as described
in the faker.js docs, for example `{{name.lastName}}, {{name.firstName}} {{name.suffix}}`.
If the string property has \*MaxLength" attribute, generated value will be limited accordingly.

```javascript
{
  "faker": {
    "Entity": {
      "Property1": "faker.method",
      "Property2": "{{faker.method}}, {{faker.method}}"
    }
  }
}
```

For example:

```javascript
{
  "faker": {
    "Product": {
      "Name": "commerce.productName",
      "Description": "{{lorem.paragraph}}, {{commerce.productDescription}}"
    }
  }
}
```

### Predefined values

If for some entities values should be randomly selected BUT from predefined set of values,
then it can be configured in the following way:

```javascript
{
  "predefined": {
    "Entity": {
      "Property": [Value1, Value2, Value3]
    }
  }
}
```

For example:

```javascript
{
  "predefined": {
    "SEPM_I_SalesOrder_EType": {
      "ID": ["myID1", "myID2", "myID3"]
    }
  }
}
```

### Predefined values based on other values

For some values it make sense to make them dependent on other values. This can be achieved in the following way:

```javascript
{
  "predefined": {
    "Entity": {
      "Property1": [Value1, Value2, Value2],
      "Property2": {
        "reference": "Property1",
        "values": [{
          "key": Value1,
          "value": "Description for value 1"
        },{
          "key": Value2,
          "value": "Description for value 2"
        }]
      }
    }
  }
}
```

Not all dependent values have to be provided; if a value is not found in the _values_ array,
it will be generated as usual.

For example we want to have valid set of IDs in

```javascript
{
  "predefined": {
    "SEPM_I_SalesOrder_EType": {
      "ID": ["myID1", "myID2", "myID3"],
      "SalesOrder_Text": {
        "reference": "ID",
        "values": [{
          "key": "myID1",
          "value": "Custom text for myID1"
         }, {
           "key": "myID2",
           "value": "Another custom text for myID2"
        }]
      }
    }
  }
}
```

### Re-using predefined values

It is easier to keep predefined values in one place, as they might be used in several places.
It can be done with help of special _variables_ property and special $ref:... handling:

```javascript
{
  "variables": {
    "myValues": [value1, value2, value3]
  },
  "predefined": {
    "Entity": {
      "Property1": "$ref:myValues",
      "Property2": {
        "reference": "Property1",
        "values": [{
          "key": "value1",
          "value": "Text1"
        }, {
          "key": "value2",
          "value": "Text2"
        }]
      }
    }
  }
}
```

For example:

```javascript
{
  "variables": {
    "salesOrderIDs": ["myID1", "myID2", "myID3"]
  },
  "predefined": {
    "SEPM_I_SalesOrder_EType": {
      "ID": "$ref:salesOrderIDs",
      "Name": {
        "reference": "ID",
        "values": [{
          "key": "myID1",
          "value": "Custom text for myID1"
        }, {
          "key": "myID2",
          "value": "Another custom text for myID2"
        }]
      }
    }
  }
}
```

### Distinct values

Having predefined values for entities and their key properties, duplicated entries will be present,
as the generator always produces the number of entries specified by the
`defaultLengthOfEntitySets` or `lengthOf: {...`
property from .rules.json. To have only distinct values (based on all key properties):

```javascript
{
    "variables": [...]
    "distinctValues": ["EnitytSet1", "EntitySet2"]
    ...
}
```

### Sample .rules.json file

Sample .rules.json file with all features, based on <https://services.odata.org/V3/Northwind/Northwind.svc/$metadata>

```javascript
{
  "skipMockGeneration": ["Summary_of_Sales_by_Quarters", "Summary_of_Sales_by_Years"],
  "variables": {
    "categoryIDs": [1, 2, 3]
  },
  "distinctValues": ["Categories"],
  "faker": {
    "Employee": {
      "City": "address.city"
    }
  },
  "lengthOf": {
    "Order_Details_Extendeds": 10
  },
  "predefined": {
    "Category": {
      "CategoryID": "$ref:categoryIDs",
      "CategoryName": {
        "reference": "CategoryID",
        "values": [{
          "key": 1,
          "value": "Custom text for ID 1"
        }, {
          "key": 2,
          "value": "Another custom text for ID 2"
        }]
      }
    }
  }
}
```

## Extension Settings

This extension contributes the following settings:

- `metadataPath`: the path to the OData service - URL or file path (relative to the project root).
  Default is webapp/localService/metadata.xml
- `mockDataRootURI`: the root URI for mock data entries. Default is "".
- `mockDataTargetDirectory`: the target directory for generated mock data files.
  Default is webapp/localService/mockdata
- `defaultLengthOfEntitySets`: default length of data set for each entity set.
  Default value is 30. It can be overridden in .rules.json
- `overwriteExistingMockFiles`: overwrite existing files in the mock data target directory?
  Default is true.
- `mockRulesConfigFilePath`: where .rules.json file should be searched for

## Release Notes

See CHANGELOG.md

## License

This plugin is licensed under the [MIT license](http://opensource.org/licenses/MIT).

## Author

Feel free to contact me:

- wozjac@zoho.com
- [jacekw.dev](https://jacekw.dev)
- Twitter (<https://twitter.com/jacekwoz>)
- LinkedIn (<https://www.linkedin.com/in/jacek-wznk>)

Icon based on a one from <https://www.freepik.com> / <https://www.flaticon.com/>
