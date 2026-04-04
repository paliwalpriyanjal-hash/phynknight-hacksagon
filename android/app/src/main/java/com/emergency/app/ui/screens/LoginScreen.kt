package com.emergency.app.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import kotlinx.coroutines.launch
import com.emergency.app.network.RetrofitClient
import com.emergency.app.network.LoginRequest
import com.emergency.app.viewmodels.MainViewModel

@Composable
fun LoginScreen(viewModel: MainViewModel, onLoginSuccess: (String) -> Unit) {
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var role by remember { mutableStateOf("USER") } // "USER" or "HOSPITAL"
    var error by remember { mutableStateOf("") }
    val coroutineScope = rememberCoroutineScope()

    Column(
        modifier = Modifier.fillMaxSize().padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text("Emergency Healthcare System", style = MaterialTheme.typography.headlineMedium)
        Spacer(modifier = Modifier.height(24.dp))

        OutlinedTextField(value = email, onValueChange = { email = it }, label = { Text("Email") })
        Spacer(modifier = Modifier.height(8.dp))
        OutlinedTextField(value = password, onValueChange = { password = it }, label = { Text("Password") })
        Spacer(modifier = Modifier.height(16.dp))

        Row(verticalAlignment = Alignment.CenterVertically) {
            RadioButton(selected = role == "USER", onClick = { role = "USER" })
            Text("Patient (USER)")
            Spacer(modifier = Modifier.width(16.dp))
            RadioButton(selected = role == "HOSPITAL", onClick = { role = "HOSPITAL" })
            Text("HOSPITAL")
        }

        if (error.isNotEmpty()) {
            Text(error, color = MaterialTheme.colorScheme.error)
            Spacer(modifier = Modifier.height(8.dp))
        }

        Button(onClick = {
            coroutineScope.launch {
                try {
                    val response = RetrofitClient.api.login(LoginRequest(email, password, role))
                    viewModel.token.value = response.token
                    viewModel.role.value = response.user.role
                    onLoginSuccess(response.user.role)
                } catch (e: Exception) {
                    error = "Login Failed: ${e.message}"
                }
            }
        }) {
            Text("Login")
        }
    }
}
