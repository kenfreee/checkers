<?php
    require_once "db.php";

    if (isset($_POST['hash']) && $_POST['hash'] !== "") {
        $data_hash = $_POST['hash'];
        $out = [];

        //Поиск пользователя в БД по `hash`.
        $data_user = execute_query(
            "SELECT * FROM `$db_name`.`users` WHERE `hash`=:hash;",
            array('hash' => $data_hash),
            true
        );

        if ($data_user) {
            $data_user = $data_user[0];
            if (isset($_POST['validate']) && $_POST['validate'] === "1") {
                if ($_SERVER['REMOTE_ADDR'] === $data_user['lastip']) {
                    $data_player = execute_query(
                        "SELECT `players`.`status`,`players`.`userID` FROM `$db_name`.`players` INNER JOIN `$db_name`.`users` ON `players`.`userID`=`users`.`ID` WHERE `players`.`userID`=:id",
                        array('id' => $data_user['ID']),
                        true
                    );
                    $data_player = $data_player[0];

                    if ($data_player['status'] === '0') {
                        execute_query(
                            "UPDATE `players` SET `status`='1' WHERE `userID`=:userID;",
                            array('userID' => $data_player['userID'])
                        );
                    }

                    $out['code'] = "ok"; //"Success."
                } else $out['code'] = "fail"; //"Bad IP."
            }

            if (isset($_POST['cancelwait']) && $_POST['cancelwait'] === "1") {
                $data_player = execute_query(
                    "SELECT `players`.`status`,`players`.`userID` FROM `$db_name`.`players` INNER JOIN `$db_name`.`users` ON `players`.`userID`=`users`.`ID` WHERE `players`.`userID`=:id",
                    array('id' => $data_user['ID']),
                    true
                );
                $data_player = $data_player[0];

                execute_query(
                    "UPDATE `players` SET `status`='0' WHERE `userID`=:userID;",
                    array('userID' => $data_player['userID'])
                );

            }

            if (isset($_POST['initboard']) && $_POST['initboard'] === "1") {
                $data_player = execute_query(
                    "SELECT `players`.`status`,`players`.`groupID`,`players`.`owner` FROM `$db_name`.`players` INNER JOIN `$db_name`.`users` ON `players`.`userID`=`users`.`ID` WHERE `players`.`userID`=:id",
                    array('id' => $data_user['ID']),
                    true
                );
                $data_player = $data_player[0];

                $data_board = execute_query(
                    "SELECT `boards`.`board` FROM `$db_name`.`boards` WHERE `groupID`=:groupID",
                    array('groupID' => $data_player['groupID']),
                    true
                );

                $out['code'] = "board";
                $out['data'] = json_encode($data_player);
                $out['board'] = $data_board[0]['board'];
            }
        } else $out['code'] = "4"; //"User not found."

        echo json_encode($out);
    }