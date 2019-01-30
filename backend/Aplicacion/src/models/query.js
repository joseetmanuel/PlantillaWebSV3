const SQL = require('mssql');

class Query {
    constructor(conf) {
        this.conf = conf;
    }

    async InsPassExpire(params, SP, res) {
        await SQL.connect(this.conf).then(async pool => {
            const REQUEST = pool.request();
            const KEYS$ = Object.keys(params);
            for (const KEY$ of KEYS$) {
                REQUEST.input(`${KEY$}`, params[KEY$]);
            }
            REQUEST.output('err', SQL.VarChar(500));
            await REQUEST.execute(SP).then(result => {
                if (result.output.err != undefined && result.output.err != null && result.output.err != '') {
                    res.send(result.output.err);
                }
                else {
                    res.send(result.recordsets);
                }
            }).catch(error => {
                res.send(`${error}`);
            });
            pool.close();
        });
        SQL.close();
    }
}
module.exports = Query;