<?php
    require_once "php/db.php";
    $data_cookies = $_COOKIE;
    $auth = false;
    $prevGame = "";

    if (isset($data_cookies['hash'])) {
            $hash = $data_cookies['hash'];

            $data_user = execute_query(
                "SELECT * FROM `$db_name`.`users` WHERE `hash`=:hash",
                array('hash' => $hash),
                true
            );

            if ($data_user) {
                $data_user = $data_user[0];
                $data_player = execute_query(
                    "SELECT `players`.`status`,`players`.`wins`,`players`.`losses` FROM `$db_name`.`players` INNER JOIN `$db_name`.`users` ON `players`.`userID`=`users`.`ID` WHERE `players`.`userID`=:id",
                    array('id' => $data_user['ID']),
                    true
                );
                $data_player = $data_player[0];

                $ip_client = $_SERVER['REMOTE_ADDR'];
                $ip_last = $data_user['lastip'];

                if ($ip_client === $ip_last)
                {
                    $username = $data_user['name'];
                    $wins = $data_player['wins'];
                    $losses = $data_player['losses'];

                    if ($data_player['status'] === '5') {
                        execute_query(
                            "UPDATE `players` SET `status`='0' WHERE `userID`=:userID;",
                            array('userID' => $data_user['ID'])
                        );
                        $prevGame = "win";
                    } elseif ($data_player['status'] === '6') {
                        execute_query(
                            "UPDATE `players` SET `status`='0' WHERE `userID`=:userID;",
                            array('userID' => $data_user['ID'])
                        );
                        $prevGame = "lose";
                    }

                    $auth = true;
                } else {
                    echo "Ваш ip-адрес сменился, авторизуйтесь снова!";
                    setcookie('hash', '', time() - 3600);
                }
            } else {
                echo "Поддельный куки!";
                setcookie('hash', '', time() - 3600);
            }
    }