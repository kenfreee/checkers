<?php
    try {
        $db_host = "localhost";
        /*$db_name = "id2467465_checkers_favorite_cf";
        $db_username = "id2467465_root";
        $db_password = "dbs55387000";*/
        $db_name = "checkers_favorite_cf";
        $db_username = "root";
        $db_password = "";

        $dbh = new PDO("mysql:host=$db_host;dbname=$db_name", $db_username, $db_password);
        $dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    } catch (PDOException $e) {
        echo 'Подключение не удалось: '.$e->getMessage();
    }

    function execute_query($sql, $params, $modifier = false) {
        global $dbh;
        $stmt = $dbh->prepare($sql);
        $stmt->execute($params);

        if ($modifier) return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }