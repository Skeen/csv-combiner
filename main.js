var ls = require('list-directory-contents');
var Converter = require("csvtojson").Converter;
var json2csv = require('json2csv');

// All files will be contained within this object
var files = {};
// Read all csv files in subdirectory
ls('firefox/', function(err, tree)
{
    if(err)
    {
        console.error(err);
        process.exit(-1);
    }

    // Fill all csv files into single object as JSON
    var next = function(file, tree, callback)
    {
        var converter = new Converter({});
        converter.fromFile(file, function(err, result)
        {
            if(err)
            {
                console.error(err);
                process.exit(-1);
            }
            files[file] = result;

            if(tree.length > 0)
                next(tree.shift(), tree, callback);
            else
                callback();
        });
    }
    //console.log(tree);
    next(tree.shift(), tree, function()
    {
        var master_object = {};

        var fields = ["Time", 'COMBINED'];
        for(var file_name in files)
        {
			var last_underscore = file_name.lastIndexOf('_');
            var short_file_name = file_name.substring(last_underscore+1, file_name.length - 4);

            fields.push(short_file_name);

            var file = files[file_name];
            for(var id in file)
            {
                var object = file[id];
                //console.log(short_file_name);
                //console.log(object.Time, ":", object.Value);
                master_object[object.Time] = master_object[object.Time] || {}
                var value = Math.round(object.Value * 100) / 100;
                    master_object[object.Time][short_file_name] = value;
            }
            //console.log(files[file_name]);
            //console.log(file);
        }

        var master_array = [];
        for(var index in master_object)
        {
            var object = master_object[index];
            object['Time'] = parseFloat(index);
            master_array.push(object);
        }
        //console.log(master_array);
        
        //console.log(master_object);
        try 
        {
            var result = json2csv({ data: master_array, fields: fields });
            console.log(result);
        }
        catch (err) 
        {
            console.error(err);
            process.exit(-1);
        }
    });
});
