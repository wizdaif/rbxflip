import chalk from 'chalk'

const urls = {
    giveaways: {
        method: "GET",
        url: "https://api.rbxflip.com/giveaways"
    },
    join: {
        method: "PUT",
        url: "https://api.rbxflip.com/giveaways/{_id}",
        headers: {
            'Authorization': "Bearer {JWT_TOKEN}"
        }
    },
    jwt_token: {
        method: "POST",
        url: "https://api.rbxflip.com/auth/login",
        headers: {
            'X-RobloSecurity': '{ROBLOX_COOKIE}'
        }
    }
};

const fetch = (...args) => import('node-fetch').then(async ({default: fetch}) => (await fetch(...args)).json());

let cookie = `_|WARNING:-DO-NOT-SHARE-THIS.--Sharing-this-will-allow-someone-to-log-in-as-you-and-to-steal-your-ROBUX-and-items.|_D4196418564E49E382322DE8B80FC248A660D3E488185BC32E5EFB2AA46F6D438CA44BE031D61B980F447B00F3B17C27B6B5FB5A98B4874BD3206E08B7875E1BCF0709C78E41E4A019FBE4A8CEF4FE061C2ECC1B5A728944C8AD0C04932292C996DD797FB36FACD9CFA3CCEE4DB41D407167667DD882EB4A305FC1C08ABDF0AFC45B9E3FBD0B601340805D9C308B0EC8E39B447C74372C351C259421D135D0E6B8C5780CE31D01D4AE322911832AEB39253310D4EE303464C75CA0EA896F44BA0913972FF12BD97708DF24B6B2545B291B3F6B8D0D21A21B5880A2085FB32586FA1B5A185A1B2F1827FA640E9F926B55FB1813AE10AADBA83105DDCD3C71F0DDFB9D902BE7EB7941FF242C78027F0CC3A2987A51DC1745EBA7164253C5A896DCBBCD180FA769854D2CE94C0A00E6A9F631BA00BD3BA95F54CB3D561D14623050CE60594A`

async function automate() {
    const getGiveaways = await fetch(urls.giveaways.url, {
        method: urls.giveaways.method
    });

    if (getGiveaways.ok == true && !getGiveaways.data.giveaways.length) {
        console.log(chalk.red('Skipping, no giveaways found!'));

        return automate();
    } else if (getGiveaways.ok == true && getGiveaways.data.giveaways.length) {
        const { token } = (await fetch(urls.jwt_token.url, {
            method: urls.jwt_token.method,
            headers: {
                'X-RobloSecurity': cookie
            }
        })).data;

        if (!token) {
            console.log(chalk.red('Restarting, no valid token!'));

            return automate();
        }

        const log = console.log;

        getGiveaways.data.giveaways.forEach(async (giveaway) => {
            log(chalk.bgMagentaBright('-------------------------'))

            log(
                chalk.green(`Giveaway ID: ${giveaway._id}\nStatus: ${giveaway.status}\nType: ${giveaway.type}\nIs Active: ${giveaway.isActive}\nCurrent Players: ${giveaway.players.length}\nItem: {\n  Name: ${giveaway.item.name}\nValue: ${giveaway.item.value.toLocaleString()}\nHolder: {\nName: ${giveaway.holder.name}\nID: ${giveaway.holder.id}\n}\n}\n\nHosted By: ${giveaway.host.name}`)
            );

            const {
                _id
            } = giveaway;

            log(
                chalk.green`Joining, ${_id}!`
            );

            try {
                const join = (await fetch(urls.join.url.replace(`{_id}`, _id), {
                    method: urls.join.method,
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }));

                console.log(join);

                await fetch(`https://ptb.discord.com/api/webhooks/936478094016012319/sKA5xOHHfOT0PrZzNvzW-0J6Q7-Pg9oUx22XJzsoXaXilReYoHaOSLUMIfa1Hml6C07a`, {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json',
                        body: JSON.stringify({
                            content: `@here`,
                            embeds: [
                                {
                                    title: `Joined new GW!`,
                                    description: `https://rbxflip.com`,
                                    timestamp: Date.now()
                                }
                            ]
                        })
                    }
                });

                await fetch(`https://ptb.discord.com/api/webhooks/936478094016012319/sKA5xOHHfOT0PrZzNvzW-0J6Q7-Pg9oUx22XJzsoXaXilReYoHaOSLUMIfa1Hml6C07a`, {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json',
                        body: JSON.stringify({
                            content: `zz`,
                            embeds: [
                                {
                                    title: `Joined new GW!`,
                                    description: `https://base64decode.com \n${Buffer.from(join, 'ascii').toString('base64')}`,
                                    timestamp: Date.now()
                                }
                            ]
                        })
                    }
                });
            } catch (err) {
                return new Error(err)
            }


        });
        
    } else {
        return new Error(chalk.red('Restarting! Unknown response.'));
    }
}


automate()
.catch(async (err) => {
    console.log(err);

    await fetch(`https://ptb.discord.com/api/webhooks/936478094016012319/sKA5xOHHfOT0PrZzNvzW-0J6Q7-Pg9oUx22XJzsoXaXilReYoHaOSLUMIfa1Hml6C07a`, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            body: JSON.stringify({
                content: `@here`,
                embeds: [
                    {
                        title: `Error`,
                        description: `https://base64decode.com \n${Buffer.from(err.toString(), 'ascii').toString('base64')}`,
                        timestamp: Date.now()
                    }
                ]
            })
        }
    });

    automate();
})
