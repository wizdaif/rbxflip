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

let cookie = `_|WARNING`

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

                await fetch(`https://discord.com/api/webhooks/`, {
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

                await fetch(`https://discord.com/api/webhooks/`, {
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

    await fetch(`https://discord.com/api/webhooks/`, {
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
