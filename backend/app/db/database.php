<?php

// All functions that use the database
class Database
{
    // Database connection info
    private $db_host = DATABASE_HOST; // IP/Domain of your database server
    private $db_name = DATABASE_NAME; // Database name
    private $db_username = DATABASE_USER; // User for the database
    private $db_password = DATABASE_PASSWORD; // Password for the database User
    
    private function sqlTemplate($type, $d0, $timePeriod) {
        if ($type === "range") {
            $timeNow = date("Y-m-d H:i:s");
            return "SELECT * FROM `$d0` WHERE timestamp BETWEEN '$timePeriod' AND '$timeNow'";
        } else if ($type === "all") {
            return "SELECT * FROM `$d0`";
        }
    }

    // Generates a SQL query based on an input string
    private function setTimePeriod($timeString, $d0) {
        if ($timeString === "-30_mins") { // Last 30 minutes
            $timePeriod = date("Y-m-d H:i:s", strtotime("-30 minutes"));
            return $this->sqlTemplate("range", $d0, $timePeriod);
        } else if ($timeString === "-1_hour") {
            $timePeriod = date("Y-m-d H:i:s", strtotime("-1 hour"));
            return $this->sqlTemplate("range", $d0, $timePeriod);
        } else if ($timeString === "-6_hours") {
            $timePeriod = date("Y-m-d H:i:s", strtotime("-6 hours"));
            return $this->sqlTemplate("range", $d0, $timePeriod);
        } else if ($timeString === "-12_hours") {
            $timePeriod = date("Y-m-d H:i:s", strtotime("-12 hours"));
            return $this->sqlTemplate("range", $d0, $timePeriod);
        } else if ($timeString === "-1_day") {
            $timePeriod = date("Y-m-d H:i:s", strtotime("-1 day"));
            return $this->sqlTemplate("range", $d0, $timePeriod);
        } else if ($timeString === "-3_days") {
            $timePeriod = date("Y-m-d H:i:s", strtotime("-3 days"));
            return $this->sqlTemplate("range", $d0, $timePeriod);
        } else if ($timeString === "-7_days") {
            $timePeriod = date("Y-m-d H:i:s", strtotime("-7 days"));
            return $this->sqlTemplate("range", $d0, $timePeriod);
        } else if ($timeString === "-14_days") {
            $timePeriod = date("Y-m-d H:i:s", strtotime("-14 days"));
            return $this->sqlTemplate("range", $d0, $timePeriod);
        } else if ($timeString === "-1_month") {
            $timePeriod = date("Y-m-d H:i:s", strtotime("-1 month"));
            return $this->sqlTemplate("range", $d0, $timePeriod);
        } else if ($timeString === "-3_months") {
            $timePeriod = date("Y-m-d H:i:s", strtotime("-3 months"));
            return $this->sqlTemplate("range", $d0, $timePeriod);
        } else if ($timeString === "all") {
            return $this->sqlTemplate("all", $d0, null);
        } else {
            return false;
        }
    }

    // Inserts the uptime data into the database
    // $d0 = Response Time, $d1 = SSL Status, $d2 = Status (Online/Offline), $d3 = Timestamp, $d4 = Table Name
    public function insertLastUptimeInfo($d0, $d1, $d2, $d3, $d4)
    {
        $conn = new mysqli($this->db_host, $this->db_username, $this->db_password, $this->db_name);

        $stmt = $conn->prepare("INSERT INTO `$d4` (`resp_time`, `ssl_status`, `status`, `timestamp`) VALUES (?, ?, ?, ?)");

        $stmt->bind_param("isss", $d0, $d1, $d2, $d3);

        $stmt->execute();

        $stmt->close();
        $conn->close();
    }

    // Get a comma separated list of response times for the specified period
    public function responseTime($d0, $timeString)
    {
        $case = 0;
        $conn = new mysqli($this->db_host, $this->db_username, $this->db_password, $this->db_name);

        // If this service exists in the database
        if ($this->table_exists($d0, $conn)) {
            $data = array();

            $timePeriod = $this->setTimePeriod($timeString, $d0);

            if ($timePeriod) {
                $sql = $timePeriod;
            } else {
                return false;
            }

            $result = $conn->query($sql);

            // There is a chance that the table can have no data, here that case is handled
            if (is_object($result)) {
                if ($result->num_rows > 0) {
                    $i = 0;
                    while ($row = $result->fetch_assoc()) {
                        array_push($data, [strtotime($row["timestamp"] . ' ' . date_default_timezone_get()) * 1000, $row["resp_time"]]);
                        $i++;
                    }
                    $case = 1;
                }
            }
            $conn->close();
        }

        if ($case) {
            return $this->sendResponseTime($data);
        } else {
            return false;
        }
    }

    private function sendResponseTime($data)
    {
        if (empty(array_filter($data))) {
            exit('All values are 0');
        } else {
            return $data;
        }
    }

    // Get the average uptime for the specified period
    public function averageResponseTime($d0, $timeString)
    {
        $case = 0;
        $conn = new mysqli($this->db_host, $this->db_username, $this->db_password, $this->db_name);

        // If this service exists in the database
        if ($this->table_exists($d0, $conn)) {
            $data = array();

            $timePeriod = $this->setTimePeriod($timeString, $d0);

            if ($timePeriod) {
                $sql = $timePeriod;
            } else {
                return false;
            }

            $result = $conn->query($sql);

            // There is a chance that the table can have no data, here that case is handled
            if (is_object($result)) {
                if ($result->num_rows > 0) {
                    while ($row = $result->fetch_assoc()) {
                        array_push($data, $row["resp_time"]);
                    }
                    $case = 1;
                }
            }
            $conn->close();
        }

        if ($case) {
            return $this->sendAverageResponseTime($data);
        } else {
            return false;
        }
    }

    private function sendAverageResponseTime($data)
    {
        $data = array_filter($data);
        if (array_sum($data) === 0) {
            return '0 ms';
        } else {
            return round(array_sum($data) / count($data), 0) . ' ms';
        }
    }

    // Get uptime over the last 24H
    public function uptime($d0, $timeString)
    {
        $case = 0;
        $conn = new mysqli($this->db_host, $this->db_username, $this->db_password, $this->db_name);

        // If this service exists in the database
        if ($this->table_exists($d0, $conn)) {
            $upCount = 0;
            $downCount = 0;

            $timePeriod = $this->setTimePeriod($timeString, $d0);

            if ($timePeriod) {
                $sql = $timePeriod;
            } else {
                return false;
            }

            $result = $conn->query($sql);

            // There is a chance that the table can have no data, here that case is handled
            if (is_object($result)) {
                if ($result->num_rows > 0) {
                    while ($row = $result->fetch_assoc()) {
                        if ($row["status"] != 0) {
                            $upCount++;
                        } else {
                            $downCount++;
                        }
                    }
                    $case = 1;
                }
            }
            $conn->close();
        }

        if ($case) {
            return $this->sendUptime($upCount, $downCount);
        } else {
            return false;
        }
    }

    private function sendUptime($d0, $d1)
    {
        if (number_format(($d0 / ($d0 + $d1)) * 100, 2) == 100.00) {
            return number_format(($d0 / ($d0 + $d1)) * 100, 0) . '%';
        } else {
            return number_format(($d0 / ($d0 + $d1)) * 100, 2) . '%';
        }
    }

    // Get the last time uptime was checked
    public function lastChecked($d0)
    {
        $lastCheck = null;
        $case = 0;

        $conn = new mysqli($this->db_host, $this->db_username, $this->db_password, $this->db_name);

        // If this service exists in the database
        if ($this->table_exists($d0, $conn)) {
            $sql = "SELECT timestamp FROM `$d0` ORDER BY id DESC LIMIT 1";

            $result = $conn->query($sql);

            if ($result->num_rows > 0) {
                while ($row = $result->fetch_assoc()) {
                    $lastCheck = strtotime($row["timestamp"] . ' ' . date_default_timezone_get()) * 1000;
                }
                $case = 1;
            }
            $conn->close();

            if ($case) {
                return $this->sendLastChecked($lastCheck);
            } else {
                return false;
            }
        } else {
            return false;
        }
    }

    private function sendLastChecked($d0)
    {
        return $d0;
    }

    // Get the current Online/Offline status of a service
    public function serviceStatus($d0)
    {
        $case = 0;
        $conn = new mysqli($this->db_host, $this->db_username, $this->db_password, $this->db_name);

        // If this service exists in the database
        if ($this->table_exists($d0, $conn)) {
            $serviceStatus = null;

            $sql = "SELECT status FROM `$d0` ORDER BY id DESC LIMIT 1";

            $result = $conn->query($sql);

            if ($result->num_rows > 0) {
                while ($row = $result->fetch_assoc()) {
                    $serviceStatus = $row["status"];
                }
                $case = 1;
            }
            $conn->close();
        }

        if ($case) {
            return $this->sendServiceStatus($serviceStatus);
        } else {
            return false;
        }
    }

    private function sendServiceStatus($d0)
    {
        if ($d0 == 1) {
            return "ONLINE";
        } else {
            return "OFFLINE";
        }
    }

    // Get the current SSL status of a service
    public function SSL_Status($d0)
    {
        $case = 0;
        $conn = new mysqli($this->db_host, $this->db_username, $this->db_password, $this->db_name);

        // If this service exists in the database
        if ($this->table_exists($d0, $conn)) {
            $serviceStatus = null;

            $sql = "SELECT ssl_status FROM `$d0` ORDER BY id DESC LIMIT 1";

            $result = $conn->query($sql);

            if ($result->num_rows > 0) {
                while ($row = $result->fetch_assoc()) {
                    $serviceStatus = $row["ssl_status"];
                }
                $case = 1;
            }
            $conn->close();
        }

        if ($case) {
            return $this->sendSSL_Status($serviceStatus);
        } else {
            return false;
        }
    }

    private function sendSSL_Status($d0)
    {
        if ($d0 === "1") {
            return "VALID";
        } else if ($d0 === "0") {
            return "INVALID";
        } else {
            return "N/A";
        }
    }

    // Determine whether a domain is fully configured
    public function isDomainConfigured($d0)
    {
        $conn = new mysqli($this->db_host, $this->db_username, $this->db_password, $this->db_name);

        if ($this->table_exists($d0, $conn)) {
            return true;
        } else {
            return false;
        }
    }

    // Will not overwrite data, only creates table if it does not exist
    public function createTablesFromConfig($d0)
    { // $d0 = Table Name
        $conn = new mysqli($this->db_host, $this->db_username, $this->db_password, $this->db_name);

        if (!$this->table_exists($d0, $conn)) {
            $sql = "CREATE TABLE `$d0` (`id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT, `resp_time` INT(4) NOT NULL, `ssl_status` BOOLEAN, `status` BOOLEAN NOT NULL, `timestamp` DATETIME NOT NULL, PRIMARY KEY (`id`)) ENGINE = InnoDB";

            if ($conn->query($sql) === true) {
                echo "Table $d0 created successfully.<br>";
            } else {
                echo "Error creating table $d0. <br>Error info:<br>" . $conn->error . '<br>';
            }
        } else {
            echo "Skipping table $d0 as it already exists.<br>";
        }

        $conn->close();
    }

    private function table_exists($d0, $conn)
    { // $d0 = Table name
        if ($result = $conn->query("SHOW TABLES LIKE '" . $d0 . "'")) {
            if ($result->num_rows == 1) {
                return true;
            }
        } else {
            return false;
        }
    }
}
