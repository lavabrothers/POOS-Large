import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'home_page.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final TextEditingController _usernameController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();

  String _message = '';

  Future<void> doLogin() async {
    final loginName = _usernameController.text;
    final loginPassword = _passwordController.text;

    final obj = {
      'username': loginName,
      'password': loginPassword,
    };

    final js = jsonEncode(obj);

    try {
      final response = await http.post(
        Uri.parse('http://134.122.3.46:3000/api/login'),
        headers: {'Content-Type': 'application/json'},
        body: js,
      );

      final res = jsonDecode(response.body);

      if (res['error'] == 'Invalid username or password.') {
        setState(() => _message = 'User/Password combination incorrect');
      } else if (res['error'] == 'Username and password are required.') {
        setState(() => _message = 'Username and password are required.');
      } else {
        final user = res['user'];
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('user_data', jsonEncode(user));

        setState(() => _message = 'Login successful!');

        // Navigate to HomePage
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (context) => const HomePage()),
        );
      }
    } catch (e) {
      setState(() => _message = 'Error: $e');
      debugPrint('Login error: $e');
    }
  }

  void goToSignup() {
    Navigator.pushNamed(context, '/signup');
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 400),
          child: Padding(
            padding: const EdgeInsets.all(20.0),
            child: ListView(
              shrinkWrap: true,
              children: [
                TextField(
                  style: const TextStyle(color: Colors.white),
                  controller: _usernameController,
                  decoration: const InputDecoration(labelText: 'Username'),
                ),
                const SizedBox(height: 10),
                TextField(
                  style: const TextStyle(color: Colors.white),
                  controller: _passwordController,
                  decoration: const InputDecoration(labelText: 'Password'),
                  obscureText: true,
                ),
                const SizedBox(height: 20),
                ElevatedButton(
                  onPressed: doLogin,
                  child: const Text('Log In'),
                ),
                const SizedBox(height: 10),
                OutlinedButton(
                  onPressed: goToSignup,
                  child: const Text('Sign Up'),
                ),
                const SizedBox(height: 20),
                Text(
                  _message,
                  textAlign: TextAlign.center,
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: _message.contains('successful')
                        ? Colors.green
                        : Colors.red,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
