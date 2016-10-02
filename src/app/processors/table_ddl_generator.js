;
(function (exports, modules) {

    function TableDDLGenerator() {

    }

    console.log();
    $.extend(TableDDLGenerator.prototype, modules.processors.AbsProcessor.prototype, {
        template: {
            headerComment: '-- DROP TABLE {0}',
            head: 'CREATE TABLE {0}',
            annotation: '@CSVColumn(columnIndex={0}, columnName="{1}")',
            propertyDefinition: 'public String {2};'
        },

        doProcess: function (opt) {
            try {
                var src = JavaParser.parse(opt.data);
                return JSON.stringify(src);
            } catch (err) {
                throw err;
            }
        }
    });

    exports.processors.TableDDLGenerator = TableDDLGenerator;

})(window, window);