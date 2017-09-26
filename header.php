<?php require_once "auth.php"; ?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title><?php
        if (stristr($_SERVER['SCRIPT_NAME'], "index")) echo "Checkers";
        elseif (stristr($_SERVER['SCRIPT_NAME'], "signup")) echo "Sign up";
        else echo "Checkers";
        ?></title>
    <link rel="stylesheet" href="css/bootstrap.min.css">
    <link rel="stylesheet" href="css/font-awesome.css">
    <link rel="stylesheet" href="css/main.css">
</head>
<body>
    <div id="wrapper">
        <!-- Sidebar -->
        <div id="sidebar-wrapper">
            <ul id="sidebar-menu" class="sidebar">
                <li class="sidebar-brand">
                    <a id="menu-toggle" data-active="false">Menu
                        <span id="main-icon" class="glyphicon glyphicon-list"></span>
                    </a>
                </li>
            </ul>
            <ul id="sidebar-nav" class="sidebar">
                <li><a href="/">Home<span class="sub-icon glyphicon glyphicon-home"></span></a></li>
            <?php if ($auth === true) : ?>
                <li><a id="logout">Log out<span class="sub-icon glyphicon glyphicon-log-out"></span></a></li>
                <li><a id="profile">Profile<span class="sub-icon glyphicon glyphicon-user"></span></a></li>
            </ul>
            <div id="sidebar-profile-menu" hidden>
                <div class="box-profile">
                    <div class="box-profile-icon">
                        <span class="fa fa-4x fa-user-o"></span>
                    </div>
                    <div class="box-profile-info">
                        <h4 class="text-center"><?php echo $username;?></h4>
                        <div class="box-profile-statistics">
                            <div class="wins">
                                <div>Wins</div>
                                <div id="resultWins"><?php echo $wins;?></div>
                            </div>
                            <div class="losses">
                                <div>Losses</div>
                                <div id="resultLosses"><?php echo $losses;?></div>
                            </div>
                        </div>
                        <button class="btn btn-success" data-search="false">
                            <i></i>
                            <span>Search game</span>
                        </button>
                    </div>
                </div>
            </div>
            <?php else : ?>
                <li><a id="login">Log in<span class="sub-icon glyphicon glyphicon-log-in"></span></a></li>
            </ul>

            <div id="sidebar-login-menu" hidden>
                <div class="box-login">
                    <form action="login.php" method="post">
                        <div class="form-group">
                            <input type="text" name="user_name" class="form-control" placeholder="Login" value="<?php if(isset($_POST['user_name'])) echo $_POST['user_name']?>">
                        </div>

                        <div class="form-group">
                            <input type="password" name="user_pass" class="form-control" placeholder="Password">
                        </div>

                        <button class="btn btn-success">
                            <i class="fa fa-sign-in"></i> Log in
                        </button>
                    </form>
                </div>
                <!--<input id="playerID-text" type="text" placeholder="Enter your id...">
                <input id="findGame-button" type="button" value="Find game">-->
            </div>
            <?php endif; ?>
        </div>

        <!-- Page content -->
        <div id="page-content-wrapper">
            <div class="page-content inset">
