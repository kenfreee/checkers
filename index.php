<?php require_once "header.php" ?>
                <div class="row">
                    <h1 class="title text-center">Checkers favorite</h1>
                    <hr>
                    <div class="box-status">
                    <?php if ($auth === false) : ?>
                        <p class="text-status"><a href="">Login</a> or <a href="signup.php">register</a> to get the opportunity to play.</p>
                    <?php else : ?>
                        <?php if ($prevGame === "win") : ?>
                        <p class="text-status">Congratulations :) You won! (+1 to the number of wins)</p>
                        <?php elseif ($prevGame === "lose"): ?>
                        <p class="text-status">Ouch :( You lost! (+1 to the number of losses)</p>
                        <?php else : ?>
                        <p class="text-status">Click <a href="">"Search game"</a> in your profile to start the game.</p>
                        <?php endif; ?>
                    <?php endif; ?>
                    </div>
                    <div id="box-game"></div>
                </div>
<?php require_once "footer.php" ?>