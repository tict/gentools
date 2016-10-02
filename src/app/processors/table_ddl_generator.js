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
            var self = this;
            try {
                var src = JavaParser.parse(opt.data);
                if (src.types && src.types.length > 0) {
                    var result = self.createDdlFromParsedType(src.types[0]);
                    return result.toString();
                } else {

                }

                return JSON.stringify(src, null, 4);
            } catch (err) {
                console.error(err.stack);
                throw err;
            }
        },

        createDdlFromParsedType: function (clzDec) {
            var ret = {
                ddl: '',
                toString: function () { return this.ddl; },
                typeDeclaration: {
                    name: null,
                    commentName: null
                },
                elements: []
            };

            ret.typeDeclaration.name = clzDec.name.identifier;

            var bodyDecs = clzDec.bodyDeclarations;
            $.each(bodyDecs, function () {
                var elm = this;
                if (elm.node !== 'FieldDeclaration')
                    return;

                var ddlElement = {
                    varName: null,
                    varType: null,
                    varIndex: null,
                    varCommentName: null
                };

                $.each(elm.fragments, function () {
                    var f = this;
                    if (f.node !== 'VariableDeclarationFragment')
                        return;

                    ddlElement.varName = f.name.identifier;
                });

                var mods = elm.modifiers;
                $.each(mods, function () {
                    var m = this;
                    if (m.node !== 'NormalAnnotation')
                        return;
                    if (m.typeName.identifier != 'CSVColumn')
                        return;

                    $.each(m.values, function () {
                        var v = this;
                        switch (v.name.identifier) {
                            case 'columnIndex': ddlElement.varIndex = v.value.token; break;
                            case 'columnName': ddlElement.varCommentName = v.value.escapedValue.replace(/^"/, '').replace(/"$/, ''); break;
                        }
                    });
                });

                if (!ddlElement.varCommentName)
                    return;

                ddlElement.varType = elm.type.name.identifier;
                ret.elements.push(ddlElement);
            });

            ret.ddl = this.createDdl(ret);
            return ret;
        },

        createDdl: function (tableInfo) {
            var self = this;
            var tableName = self.modifyName(tableInfo.typeDeclaration.name);
            var ret = 'CREATE TABLE ' + tableName;
            ret += '\n(\n';
            ret += '    ' + tableName + '_id serial PRIMARY KEY,\n';

            $.each(tableInfo.elements, function () {
                var elm = this;
                ret += self.createColumnDeclarationLine(self.modifyName(elm.varName) + ' text, -- ' + elm.varCommentName + ',');
            })

            ret += '\n';
            ret += self.createCommonColumns();
            ret += ');\n';
            return ret;
        },

        createColumnDeclarationLine: function(str) {
            return '    ' + str + '\n';
        },

        createCommonColumns : function() {
            var ret = '';
            ret += this.createColumnDeclarationLine('create_dt timestamp without time zone DEFAULT now(),');
            ret += this.createColumnDeclarationLine('update_dt timestamp without time zone DEFAULT now(),');
            ret += this.createColumnDeclarationLine('create_staff_id integer DEFAULT 0,');
            ret += this.createColumnDeclarationLine('update_staff_id integer DEFAULT 0,');
            ret += this.createColumnDeclarationLine('delete_flag integer DEFAULT 0,');
            ret += this.createColumnDeclarationLine('version_no integer DEFAULT 0,');

            return ret;
        },

        modifyName: function (str) {
            return str.replace(/(?:^|\.?)([A-Z])/g, function (x,y){return "_" + y.toLowerCase()}).replace(/^_/, "");
        }
    });

    exports.processors.TableDDLGenerator = TableDDLGenerator;

})(window, window);