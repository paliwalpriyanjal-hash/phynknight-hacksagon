package com.emergency.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.emergency.app.ui.screens.LoginScreen
import com.emergency.app.ui.screens.hospital.HospitalDashboardScreen
import com.emergency.app.ui.screens.patient.PatientDashboardScreen
import com.emergency.app.ui.theme.EmergencyTheme
import com.emergency.app.viewmodels.MainViewModel

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            EmergencyTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    AppNavigation()
                }
            }
        }
    }
}

@Composable
fun AppNavigation(mainViewModel: MainViewModel = viewModel()) {
    val navController = rememberNavController()

    NavHost(navController = navController, startDestination = "login") {
        composable("login") {
            LoginScreen(
                viewModel = mainViewModel,
                onLoginSuccess = { role ->
                    if (role == "HOSPITAL") navController.navigate("hospital_dashboard")
                    else navController.navigate("patient_dashboard")
                }
            )
        }
        composable("hospital_dashboard") {
            HospitalDashboardScreen(viewModel = mainViewModel)
        }
        composable("patient_dashboard") {
            PatientDashboardScreen(viewModel = mainViewModel)
        }
    }
}
