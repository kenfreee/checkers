<?php
    require_once "php/db.php";

    $data = $_POST;
    $data_username = $data['user_name'];
    $data_password = $data['user_pass'];

    $data_db_user = execute_query(
        "SELECT * FROM `$db_name`.`users` WHERE `login`=:login",
        array('login' => $data_username),
        true
    );

    if (!empty($data_db_user)) {
        $data_db_user = $data_db_user[0];

        if (password_verify($data_password, $data_db_user['password'])) {
            /*array_splice($row, 4, -1);
        $_SESSION['logged_user'] = $row;*/
            $id = $data_db_user['ID'];
            $ip = $_SERVER['REMOTE_ADDR'];

            $hash = password_hash(time() + rand(), PASSWORD_DEFAULT);

            execute_query(
                "UPDATE `$db_name`.`users` SET `hash`=:hash WHERE ID=:id",
                array('hash' => $hash, 'id' => $id)
            );

            execute_query(
                "UPDATE `$db_name`.`users` SET `lastip`=:ip WHERE ID=:id",
                array('ip' => $ip, 'id' => $id)
            );

            setcookie('hash', $hash, time() + 3600);
            //setcookie('login', $data_db_user['login'], time() + 3600);
            header("Location: index.php");
        } else {
            echo "Неверный пароль!";
        }
    } else {
        echo "Логин $data_username не найден!";
    }
/*require "apps/header.php";
require "apps/footer.php";*/