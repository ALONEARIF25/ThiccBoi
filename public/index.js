<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ThiccBoiBot Homepage</title>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap"
        rel="stylesheet">
    <style>
        body {
            font-family: 'Poppins', sans-serif;
            background-color: #202020;
            margin: 0;
            padding: 0;
        }


        .container {
            width: 80%;
            margin: auto;
            overflow: hidden;

        }

        header {
            background: #323229;
            color: antiquewhite;
            padding-top: 30px;
            min-height: 70px;
            border-bottom: #77aaff 3px solid;
        }

        header a {
            color: #fff;
            text-decoration: none;
            text-transform: uppercase;
            font-size: 14px;
        }

        header ul {
            padding: 0;
            list-style: none;
        }

        header li {
            float: left;
            display: inline;
            padding: 0 15px 0 0px;

        }

        header #branding {
            float: left;
        }

        header #branding h1 {
            margin: 0;
        }

        header nav {
            float: right;
            margin-top: 10px;
        }

        #showcase {
            background: #333;
            color: antiquewhite;
            text-align: center;
            padding-top: 100px;
        }

        #showcase h1 {
            font-size: 55px;
            margin-top: 0;
        }

        #showcase p {
            font-size: 20px;
        }


        table {
            width: 100%;
            border-collapse: collapse;
        }

        table,
        th,
        td {
            border: 1px solid #ddd;
        }

        th,
        td {
            padding: 8px;
            text-align: left;
        }

        th {
            background-color: #f2f2f2;
        }

        #botstatus-details,
        #allcmds {
            margin: 30px 0;
            padding: 30px;
            background: #323229;
            border-radius: 15px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        }

        #botstatus-details h2 {
            color: antiquewhite;
            margin-bottom: 20px;
            font-weight: 600;
        }

        #status-info {
            display: flex;
            gap: 30px;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 10px;
        }

        #status-info p {
            margin: 0;
            font-size: 16px;
            color: #555;
        }

        #status-info span {
            font-weight: 500;
            color: #333;
            margin-left: 8px;
        }

        /* Update header font */
        header #branding h1 {
            font-family: 'Poppins', sans-serif;
            font-weight: 600;
        }

        /* Update showcase fonts */
        #showcase h1 {
            font-family: 'Poppins', sans-serif;
            font-weight: 700;
        }



        :root {
            --yellow-light: #fff9c4;
            --yellow-main: #ffeb3b;
            --yellow-dark: #c79c30;
            --yellow-deep: #c9af3b;
        }

        /* Update existing color schemes */

        header {
            border-bottom: var(--yellow-main) 3px solid;
        }

        #showcase {
            background: var(--yellow-dark);
        }

        #botstatus-details,
        #allcmds {
            border-left: 4px solid var(--yellow-main);
        }

        #status-info {
            background: var(--yellow-light);
        }

        th {
            background-color: var(--yellow-light);
        }

        table,
        th,
        td {
            border: 1px solid var(--yellow-dark);
        }

        .botprofile {
            background: #323229;
            border-radius: 10px;
            padding: 10px;
            display: flex;
            align-items: flex-start;
            gap: 20px;
            /* margin-bottom: 20px; */
            margin: auto;
            max-width: 240px;
            max-height: 56px;
        }

        .botprofile h2 {
            color: antiquewhite;
            font-size: 16px;
            font-weight: 500;
            margin-top: 5px;
            margin-bottom: 0px;
        }

        #status-indicator {
            position: absolute;
            bottom: 5px;
            right: -3px;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            border: 4px solid #323229;
        }

        #bot-activity-status {
            color: #b9bbbe;
            margin: 0px 0;
            font-size: 13px;
        }

        .bot-badge {
            display: flex;
            align-items: center;
            background-color: #5865F2;
            height: 12px;
            width: 41px;
            border-radius: 5px;
            color: #ffffff;
            padding: 3px 6px;
            font-size: 12px;
            font-weight: 500;
        }



        @media screen and (max-width: 768px) {
            * {
                box-sizing: border-box;
            }

            header #branding,
            header nav,
            header nav li {
                float: none;
                text-align: center;
                width: 100%;
            }

            .container {
                width: 100%;
                padding: 0 15px;
            }

            #showcase h1 {
                font-size: 40px;
            }

            #status-info {
                flex-direction: column;
                gap: 15px;
            }

            .botprofile {
                box-sizing: content-box;
            }

            #status-indicator {
                box-sizing: content-box;
            }

            .bot-badge {
                box-sizing: content-box;
            }

        }

        .addtoserver {
            background-color: #c79c30;
            padding: 5px 12px;
            border-radius: 5px;
            font-size: 13px;
            font-weight: 500;
            transition: all 0.3s;
            border: none;
            color: white;
            cursor: pointer;
            font-family: 'Poppins', sans-serif;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .addtoserver:hover {
            background-color: #ffeb3b;
            transform: scale(1.05);
            box-shadow: 0 0 10px rgba(255, 235, 59, 0.5);
            color: #202020;
        }
    </style>

</head>

<body>
    <header>
        <div class="container">
            <div id="branding">
                <h1>ThiccBoiBot</h1>
            </div>
            <nav>
                <ul>
                    <li><button class="addtoserver"
                            onclick="window.location.href='https://discord.com/oauth2/authorize?client_id=863351223587438622&permissions=4164414073&scope=bot%20applications.commands'">Add
                            to Server</button></li>
                </ul>
            </nav>
        </div>
    </header>

    <div class="container" style="padding: 20px;"></div>
    <div class="botprofile">
        <div style="position: relative;">
            <img id="bot-avatar" style="width: 55px; height: 55px; border-radius: 50%;" alt="Bot Avatar">
            <div id="status-indicator">
            </div>
        </div>
        <div>
            <div style="display: flex; align-items: center; gap: 8px;">
                <h2 id="bot-username"></h2>
                <div class="bot-badge">
                    <svg style="scale: 1.3;" width="100%" height="100%" viewBox="0 0 24 24" fill="none"
                        xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="3" stroke-linecap="round"
                            stroke-linejoin="round" />
                    </svg>
                    <div style="margin-left: 2px;">APP</div>
                </div>
            </div>
            <p id="bot-activity-status"></p>
        </div>
    </div>
    </div>

    <script>
        async function fetchBotProfile() {
            try {
                const response = await fetch('/botprofile');
                const data = await response.json();
                document.getElementById('bot-avatar').src = data.pfpurl;
                document.getElementById('bot-username').textContent = data.username;

                const statusResponse = await fetch('/botstatus');
                const statusData = await statusResponse.json();
                document.getElementById('bot-activity-status').textContent = statusData.activity;

                const statusColor = {
                    'online': '#43b581',
                    'idle': '#faa61a',
                    'dnd': '#f04747',
                    'offline': '#747f8d'
                };
                document.getElementById('status-indicator').style.backgroundColor = statusColor[statusData.status] || '#747f8d';
            } catch (error) {
                console.error('Error fetching bot profile:', error);
            }
        }

        setInterval(fetchBotProfile, 5000);
        fetchBotProfile();
    </script>
    <div class="container">
        <section id="botstatus-details">
            <h2>Current Bot Status</h2>
            <div id="status-info">
                <p>Status: <span id="bot-status">Offline</span></p>
                <p>Activity: <span id="bot-activity">Offline</span></p>
                <p>Server Count: <span id="server-count">Offline</span></p>
            </div>
        </section>

        <script>
            async function fetchServerCount() {
                try {
                    const response = await fetch('/servercount');
                    const data = await response.json();
                    document.getElementById('server-count').textContent = data.servers;
                } catch (error) {
                    console.error('Error fetching server count:', error);
                }
            }
            setInterval(fetchServerCount, 5000);
            fetchServerCount(); // Initial fetch
        </script>

        <script>
            // Add this to your existing JavaScript
            async function fetchBotStatusDetails() {
                try {
                    const response = await fetch('/botstatus');
                    const data = await response.json();
                    const statusElement = document.getElementById('bot-status');

                    // Set status with additional description
                    let statusText = data.status;
                    if (['online', 'idle', 'dnd'].includes(data.status.toLowerCase())) {
                        statusText += ' (Operational)';
                    }
                    statusElement.textContent = statusText;

                    document.getElementById('bot-activity').textContent = data.activity;
                } catch (error) {
                    console.error('Error fetching bot status:', error);
                }
            }

            // Update status every 5 seconds
            setInterval(fetchBotStatusDetails, 5000);
            fetchBotStatusDetails(); // Initial fetch
        </script>

        <section id="allcmds">
            <h2 style="color: antiquewhite;">All Commands</h2>
            <table style="color: antiquewhite;" id="commandsTable">
                <thead>
                    <tr style="color: #202020;">
                        <th>Command</th>
                        <th>Description</th>
                    </tr>
                </thead>
                <tbody>
                    <!-- Commands will be populated here -->
                </tbody>
            </table>
        </section>
    </div>

    <script>

        async function fetchAllCommands() {
            const response = await fetch('/allcmds');
            const data = await response.json();
            updateCommandsTable(data);
        }



        function updateCommandsTable(data) {
            const tableBody = document.querySelector('#commandsTable tbody');
            tableBody.innerHTML = '';
            data.commands.forEach(command => {
                const row = document.createElement('tr');
                const commandCell = document.createElement('td');
                const descriptionCell = document.createElement('td');
                commandCell.textContent = command.name;
                descriptionCell.textContent = command.description;
                row.appendChild(commandCell);
                row.appendChild(descriptionCell);
                tableBody.appendChild(row);
            });
        }
        fetchAllCommands();
    </script>
</body>


</section>
</div>
</div>

</html>
