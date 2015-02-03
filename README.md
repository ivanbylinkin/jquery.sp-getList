# SP-getList
getList is a plugin that works in cooperation with SPServices to quickly pull a SharePoint list's content.

## Basic Usage

The plugin can be quickly initiated from anywhere in your code with just a few lines of code.<br>
**prerequisites: include jQuery and this plugin to your html page**

```javascript
$.fn.getList({
  listName: "My List",
  fields: ["field1", "field2", "field_x0020_three", "etc."],
  completefunc: function(raw){
    // raw contains 4 parameters: changeToken, data, mapping, deletedIds
    var jsonData = raw.data;
  }
});
```

**multi-list call**

```javascript
$.fn.getList({
  listNames: ["My First List", "My Second List"],
  fields: [["field1", "field2", "field_x0020_three", "etc."],["field1", "field2", "field_x0020_three", "etc."]],
  completefunc: function(raw){
    // raw is an array of objects containing 4 parameters: changeToken, data, mapping, deletedIds
    var list1Data = raw[0].data,
    list2Data = raw[1].data;
    // you could also join the data instead
    var jsonData = [];
    for (var i=0; i<raw.length; i++){
      $.merge(jsonData, raw[i].data);
    }
  }
});
```

## Explanation

There are 2 versions of getList included within the javascript file: getList and getListSimple.
* **getListSimple** is a simple call that will return a JSON object of the list.
* **getList** returns a promise that will contain a JSON object of the list as well as a change token, mappings, and deleted items since the last change token used
  * getList also allows you to pass a *completefunc* parameter which will fire when the promise is resolved
* **getList** allows for multiple lists by passing the parameter *listNames* instead of *listName*

The following will discuss the main plugin **getList**<br>
You need to pass an object to the plugin with the following possible values:<br>
**parameters denoted with * are required**

| Parameter | Description          |
| ------------- | ----------- |
| *listName      | a string value of the name of the string you want to return |
| *fields     | an array of internal column names of columns you want to return<br>**for example, columns with a space in the name will be stored as My_x0020_Column**|
| query     | a valid CAMLQuery string starting with ```"<Query>"``` |
| types     | an array of types with a length equal to the fields array<br>*each type will be matched with corresponding field*<br>more information available here: http://spservices.codeplex.com/wikipage?title=%24%28%29.SPXmlToJson|
| changeToken     | a change token string, usually used for a second call once you have a changeToken from the previous call |
| completefunc    | a function taking the parameter *data* which will execute when the data is available |
| listNames       | used in place of *listName* when initiating multiple lists, fields and types should then be passed as an array of arrays |

*defaults, located at $.fn.getList.defaults*<br>for more information please visit: https://spservices.codeplex.com/wikipage?title=%24%28%29.SPServices.SPGetListItemsJson

| Parameter | Value          |
| ------------- | ----------- |
| webURL     | "" |
| listName     | "" |
| viewName     | "" |
| CAMLQuery     | "<Query><OrderBy Override='TRUE'><FieldRef Ascending='FALSE' Name='ID' /></OrderBy><Where><IsNotNull><FieldRef Name='ID' /></IsNotNull></Where></Query>" |
| CAMLViewFields     | "" |
| CAMLRowLimit     | 5000 |
| CAMLQueryOptions     | "" |
| changeToken     | "" |
| mapping     | null |
| mappingOverrides     | null |
|debug| true |
