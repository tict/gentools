;
(function (exports, modules) {

    function TableDDLGenerator() {

    }

    console.log();
    $.extend(TableDDLGenerator.prototype, modules.processors.AbsProcessor.prototype, {
        doProcess: function (opt) {
            return 'asdf';
        }
    });

    exports.processors.TableDDLGenerator = TableDDLGenerator;

})(window, window);