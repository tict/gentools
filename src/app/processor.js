
;
(function(exports) {

    function AbsProcessor() {

    }

    $.extend(AbsProcessor.prototype, {
        start: function (opt) {
            var ret = new $.Deferred();
            try {
                ret.resolve({ status: 'OK', failure: false, result: this.doProcess(opt) });
            } catch (err) {
                ret.reject({ status: 'NG', failure: true, result: err });
            }

            return ret.promise();
        },

        trim: function(str) {
            if (!str)
                return str;

            return str.trim();
        },

        doProcess: function (opt) {
            console.log('implement in concrete class.');
        }
    });


    exports.processors = { AbsProcessor : AbsProcessor };


    /**
     *
     */
    function JavaCsvClassGenerator() { }
    $.extend(JavaCsvClassGenerator.prototype, AbsProcessor.prototype, {
        template: {
            headerComment: '/** {0} */',
            annotation: '@CSVColumn(columnIndex={0}, columnName="{1}")',
            propertyDefinition: 'public String {2};'
        },

        doProcess: function (opt) {
            var elms = opt.data.split(',');
            var self = this;
            var result = '';
            for (var i = 0; i < elms.length; i++) {
                var e = self.trim(elms[i]);
                var src = self.createPropertySrc(opt, { index: i, name: e });
                if (src) {
                    if (result.length > 0) {
                        result += '\n\n' + src;
                    } else {
                        result += src;
                    }
                }
            }

            return result;
        },

        createPropertySrc: function (opt, col) {
            var header = this.template.headerComment.replace('{0}', col.name);
            var annotation = this.template.annotation.replace('{0}', col.index).replace('{1}', col.name);
            var prop = this.template.propertyDefinition.replace('{2}', 'p_' + col.name);

            return header + '\n' + annotation + '\n' + prop;
        },
    })

    exports.processors = { JavaCsvClassGenerator: JavaCsvClassGenerator };

})(window);