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

        if ($data_user) { //Если такой пользователь существует.
            $data_user = $data_user[0];
            $data_player = execute_query(
                "SELECT `$db_name`.`players`.* FROM `players` INNER JOIN `users` ON `players`.`userID`=`users`.`ID` WHERE `players`.`userID`=:id",
                array('id' => $data_user['ID']),
                true
            );
            $data_player = $data_player[0];

            if (isset($_POST['boardData']) && $_POST['boardData'] !== "")
            {
                $data_board = $_POST['boardData'];

                if ($data_player['groupID'] !== NULL) {
                    execute_query(
                        "UPDATE `players` SET `status`='3' WHERE `userID`=:userID;",
                        array('userID' => $data_player['userID'])
                    );

                    execute_query(
                        "UPDATE `boards` SET `board`=:board WHERE `groupID`=:groupID;",
                        array('board' => $data_board, 'groupID' => $data_player['groupID'])
                    );

                    execute_query(
                        "UPDATE `players` SET `status`='2' WHERE `userID`!=:userID AND `groupID`=:groupID;",
                        array('userID' => $data_player['userID'], 'groupID' => $data_player['groupID'])
                    );
                }
            }
            elseif (isset($_POST['check']) && $_POST['check'] === "1")
            {
                $data_check = $_POST['check'];

                if ($data_player['status'] === '2') {
                    $data_board = execute_query(
                        "SELECT `boards`.`board` FROM `boards` WHERE `groupID`=:groupID",
                        array('groupID' => $data_player['groupID']),
                        true
                    );

                    $out['code'] = "9";
                    $out['data'] = $data_board[0]['board'];
                } elseif ($data_player['status'] === '5' || $data_player['status'] === '6') {
                    $out['code'] = "10";
                }
            }
            elseif (isset($_POST['leave']) && $_POST['leave'] === "1")
            {
                execute_query(
                    "UPDATE `players` SET `status`='6',`groupID`=NULL,`owner`=NULL,`losses`=`losses` + 1 WHERE `userID`=:userID;",
                    array('userID' => $data_player['userID'])
                );

                execute_query(
                    "UPDATE `players` SET `status`='5',`groupID`=NULL,`owner`=NULL,`wins`=`wins` + 1 WHERE `groupID`=:groupID AND `userID`!=:userID;",
                    array('groupID' => $data_player['groupID'], 'userID' => $data_player['userID'])
                );

                execute_query(
                    "DELETE FROM `boards` WHERE `boards`.`groupID`=:groupID;",
                    array('groupID' => $data_player['groupID'])
                );
            }
            elseif (isset($_POST['winner']) && $_POST['winner'] === "1")
            {
                execute_query(
                    "UPDATE `players` SET `status`='5',`groupID`=NULL,`owner`=NULL,`wins`=`wins` + 1 WHERE `userID`=:userID;",
                    array('userID' => $data_player['userID'])
                );

                execute_query(
                    "UPDATE `players` SET `status`='6',`groupID`=NULL,`owner`=NULL,`losses`=`losses` + 1 WHERE `groupID`=:groupID AND `userID`!=:userID;",
                    array('groupID' => $data_player['groupID'], 'userID' => $data_player['userID'])
                );

                execute_query(
                    "DELETE FROM `boards` WHERE `boards`.`groupID`=:groupID;",
                    array('groupID' => $data_player['groupID'])
                );
            }
            elseif ($data_player['status'] === '1') //Если у игрока еще нету противника.
            {
                //Получаем список всех врагов, ожидающих игру.
                $data_enemies = execute_query(
                    "SELECT * FROM `$db_name`.`players` WHERE `status`='1' AND `userID`!=:userID AND `groupID` IS NULL",
                    array('userID' => $data_player['userID']),
                    true
                );

                if ($data_enemies) { //Если в списке есть враги.
                    //Функция выбирает врага из тех кто в режиме поиска.
                    function get_enemy($enemies) {
                        return $enemies[0];
                    }
                    $data_enemy = get_enemy($data_enemies); //Выбираем врага из списка.
                    $groupID = $data_player['userID'].$data_enemy['userID']; //Создаем ID группы(ID игрока + ID врага).

                    //Устанавливаем ID группы игроку и врагу
                    execute_query(
                        "UPDATE `$db_name`.`players` SET `status`='2',`groupID`=:groupID,`owner`='white' WHERE `userID`=:userID;",
                        array('groupID' => $groupID, 'userID' => $data_player['userID'])
                    );

                    execute_query(
                        "UPDATE `$db_name`.`players` SET `status`='3',`groupID`=:groupID,`owner`='black' WHERE `userID`=:enemyID;",
                        array('groupID' => $groupID, 'enemyID' => $data_enemy['userID'])
                    );

                    execute_query(
                        "INSERT INTO `$db_name`.`boards` (`ID`, `groupID`, `board`) VALUES (NULL, :groupID, DEFAULT)",
                        array('groupID' => $groupID)
                    );

                    $data_enemy = execute_query(
                        "SELECT * FROM `$db_name`.`players` WHERE `groupID`=:groupID AND `userID`!=:userID;",
                        array('groupID' => $groupID, 'userID' => $data_player['userID']),
                        true
                    );

                    $out['code'] = "6";
                    $out['data'] = json_encode($data_enemy[0]);
                } else $out['code'] = "5"; //"There are no players in the search mode."
            }
            else if ($data_player['status'] === '2' || $data_player['status'] === '3')
            {
                //Получаем данные врага.
                $data_enemy = execute_query(
                    "SELECT * FROM `$db_name`.`players` WHERE `groupID`=:groupID AND `userID`!=:userID;",
                    array('groupID' => $data_player['groupID'], 'userID' => $data_player['userID']),
                    true
                );

                $out['code'] = "7";
                $out['data'] = json_encode($data_enemy[0]);
            }
        } else $out['code'] = "4"; //"Player not found."

        echo json_encode($out);
    }