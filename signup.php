<?php
    require_once "php/db.php";

    $data = $_POST;
    $reg_succ = false;

    if (isset($data['signup_do'])) {
        $errors = array();
        $data_name     = trim($data['name']);
        $data_email    = trim($data['email']);
        $data_username = trim($data['username']);
        $data_password = trim($data['password']);
        $data_confirm  = trim($data['confirm']);

        if ($data_name === '') $errors[] = 'Введите Ваше имя.';
        if ($data_email === '') $errors[] = 'Введите Ваш E-mail.';
        if ($data_username === '') $errors[] = 'Введите Ваш логин.';
        if ($data_password === '') $errors[] = 'Введите Ваш пароль.';
        if ($data_confirm != $data_password) $errors[] = 'Пароли не совпадают.';

        $data_db_user = execute_query(
            "SELECT * FROM `$db_name`.`users` WHERE `login`=:login",
            array('login' => $data_username),
            true
        );

        $data_db_email = execute_query(
            "SELECT * FROM `$db_name`.`users` WHERE `email`=:email",
            array('email' => $data_email),
            true
        );

        if (!empty($data_db_user)) $errors[] = "Пользователь с логином $data_username уже существует.";
        if (!empty($data_db_email)) $errors[] = "Пользователь с E-mail'ом $data_email уже существует.";

        if (empty($errors)) {
            execute_query(
                "INSERT INTO `$db_name`.`users` (`id`, `name`, `email`, `login`, `password`, `hash`, `lastip`, `time`) VALUES (NULL, :name, :email, :login, :password, :hash, :lastip, :time)",
                array(
                    'name' => $data_name,
                    'email' => $data_email,
                    'login' => $data_username,
                    'password' => password_hash($data_password, PASSWORD_DEFAULT),
                    'hash' => 'NULL',
                    'lastip' => 'NULL',
                    'time' => time()
                )
            );

            $data_db_user = execute_query(
                "SELECT * FROM `$db_name`.`users` WHERE `login`=:login",
                array('login' => $data_username),
                true
            );

            execute_query(
                "INSERT INTO `$db_name`.`players` (`ID`, `userID`, `status`, `groupID`, `owner`, `wins`, `losses`) VALUES (NULL, :ID, '0', NULL, NULL, DEFAULT, DEFAULT);",
                array('ID' => $data_db_user[0]['ID'])
            );

            $reg_succ = true;
        }
    }

    require_once "header.php"
?>
                <div class="row">
                <?php if ($reg_succ === false) : ?>
                    <h1 class="title text-center">Registration</h1>
                    <?php if(!empty($errors)) echo '<div class="box-status box-top box-330"><p id="prompt-fail" class="text-status">'.array_shift($errors).'</p></div>'; else echo '<div class="box-status box-top box-330"><p id="prompt-normal" class="text-status">Заполните все поля.</p></div>';?>
                    <hr>
                    <div class="signup">
                        <div class="main-login main-center">
                            <form class="form-horizontal" method="post" action="signup.php">
                                <div class="form-group">
                                    <label for="name" class="cols-sm-2 control-label">Your Name</label>
                                    <div class="cols-sm-10">
                                        <div class="input-group">
                                            <span class="input-group-addon"><i class="fa fa-user fa" aria-hidden="true"></i></span>
                                            <input name="name" id="name" type="text" class="form-control"  placeholder="Enter your Name" value="<?php if(isset($data['name'])) echo $data['name']?>"/>
                                        </div>
                                    </div>
                                </div>

                                <div class="form-group">
                                    <label for="email" class="cols-sm-2 control-label">Your Email</label>
                                    <div class="cols-sm-10">
                                        <div class="input-group">
                                            <span class="input-group-addon"><i class="fa fa-envelope fa" aria-hidden="true"></i></span>
                                            <input name="email" id="email" type="email" class="form-control" placeholder="Enter your Email" value="<?php if(isset($data['email'])) echo $data['email']?>"/>
                                        </div>
                                    </div>
                                </div>

                                <div class="form-group">
                                    <label for="username" class="cols-sm-2 control-label">Username</label>
                                    <div class="cols-sm-10">
                                        <div class="input-group">
                                            <span class="input-group-addon"><i class="fa fa-users fa" aria-hidden="true"></i></span>
                                            <input name="username" id="username" type="text" class="form-control" placeholder="Enter your Username" value="<?php if(isset($data['username'])) echo $data['username']?>"/>
                                        </div>
                                    </div>
                                </div>

                                <div class="form-group">
                                    <label for="password" class="cols-sm-2 control-label">Password</label>
                                    <div class="cols-sm-10">
                                        <div class="input-group">
                                            <span class="input-group-addon"><i class="fa fa-lock fa-lg" aria-hidden="true"></i></span>
                                            <input name="password" id="password" type="password" class="form-control" placeholder="Enter your Password"/>
                                        </div>
                                    </div>
                                </div>

                                <div class="form-group">
                                    <label for="confirm" class="cols-sm-2 control-label">Confirm Password</label>
                                    <div class="cols-sm-10">
                                        <div class="input-group">
                                            <span class="input-group-addon"><i class="fa fa-lock fa-lg" aria-hidden="true"></i></span>
                                            <input name="confirm" id="confirm" type="password" class="form-control" placeholder="Confirm your Password"/>
                                        </div>
                                    </div>
                                </div>

                                <div class="form-group">
                                    <button name="signup_do" type="submit" class="btn btn-success btn-lg btn-block login-button">Register</button>
                                </div>
                            </form>
                        </div>
                    </div>
                <?php else : ?>
                    <h1 class="title text-center succ">Registration completed successfully!</h1>
                    <hr>
                    <div class="box-status">
                        <p class="text-status">You will be redirected to the <a href="/CheckersNet/src/">main page</a> of the site in 5 seconds...</p>
                    </div>
                    <script type="text/javascript">
                        setTimeout('location.replace("/")', 5000);
                    </script>
                <?php endif; ?>
                </div>
<?php require_once "footer.php" ?>