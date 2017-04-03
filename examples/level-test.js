var nsql = require("../node/index-server.js").nSQL;

function makeid() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 10; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

nsql("users")
    .model([
        { key: "id", type: "uuid", props: ["pk"] },
        { key: "name", type: "string" },
        { key: "pass", type: 'string' },
        { key: "email", type: "string" }
    ])
    .config({ memory: false, persistent: true, history: false })
    .connect().then(() => {
        let i = 0;
        console.time("WRITE");
        nsql("users").beginTransaction();
        const step = () => {
                if (i < 9000) {
                    nsql("users")
                        .query("upsert", {
                            name: makeid(),
                            pass: makeid(),
                            email: makeid()
                        }).exec().then(() => {
                            i++;
                            if (i % 100 === 0) {
                                console.log(i);
                            }
                            step();
                        })
                } else {
                    nsql("users").endTransaction();
                    console.timeEnd("WRITE");
                }
            }
            //step();
        console.time("READ");
        nsql("users").query("select").exec().then((rows) => {
            console.timeEnd("READ");
            console.log(rows.length);
        })
    });