import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:lottie/lottie.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final TextEditingController _usernameController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  final TextEditingController _forgotPasswordEmailController = TextEditingController();

  String _message = '';
  bool _loading = false;

  String _forgotPasswordMessage = '';
  bool _forgotPasswordLoading = false;

  Future<void> doLogin() async {
    final loginName = _usernameController.text.trim();
    final loginPassword = _passwordController.text.trim();

    if (loginName.isEmpty || loginPassword.isEmpty) {
      setState(() => _message = 'Username and password are required.');
      return;
    }

    setState(() {
      _message = '';
      _loading = true;
    });

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
        setState(() {
          _message = 'User/Password combination incorrect';
          _loading = false;
        });
      } else if (res['error'] == 'Username and password are required.') {
        setState(() {
          _message = 'Username and password are required.';
          _loading = false;
        });
      } else if (res['error']?.contains('not verified') == true) {
        setState(() {
          _message = res['error'];
          _loading = false;
        });
      } else {
        final user = res['user'];
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('user_data', jsonEncode(user));

        if (!mounted) return;
        Navigator.pushReplacementNamed(context, '/home');
      }
    } catch (e) {
      setState(() {
        _message = 'Error: $e';
        _loading = false;
      });
    }
  }

  Future<void> doForgotPassword() async {
    final email = _forgotPasswordEmailController.text.trim();
    if (email.isEmpty) {
      setState(() => _forgotPasswordMessage = 'Please enter an email address.');
      return;
    }

    setState(() {
      _forgotPasswordMessage = '';
      _forgotPasswordLoading = true;
    });

    final obj = {'email': email};
    final js = jsonEncode(obj);

    try {
      final response = await http.post(
        Uri.parse('http://134.122.3.46:3000/api/request-password-reset'),
        headers: {'Content-Type': 'application/json'},
        body: js,
      );

      final res = jsonDecode(response.body);

      if (res['error'] == 'Email is required.') {
        setState(() => _forgotPasswordMessage = 'Please enter an email address.');
      } else if (res['error'] == 'Email does not exist in our database.') {
        setState(() => _forgotPasswordMessage = 'This email does not match our records.');
      } else {
        setState(() => _forgotPasswordMessage = 'Email sent!');
        Future.delayed(const Duration(seconds: 2), () {
          Navigator.of(context).pop(); // Close the dialog
          _forgotPasswordEmailController.clear();
          setState(() => _forgotPasswordMessage = '');
        });
      }
    } catch (e) {
      setState(() => _forgotPasswordMessage = 'Error: $e');
    } finally {
      setState(() => _forgotPasswordLoading = false);
    }
  }

  void showForgotPasswordDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Reset Password', style: TextStyle(color: Colors.white)),
        backgroundColor: Colors.black87,
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text("We'll send you an email to reset your password.", style: TextStyle(color: Colors.white)),
            const SizedBox(height: 10),
            TextField(
              controller: _forgotPasswordEmailController,
              style: const TextStyle(color: Colors.white),
              decoration: const InputDecoration(
                labelText: 'Email',
                labelStyle: TextStyle(color: Colors.white70),
                enabledBorder: UnderlineInputBorder(borderSide: BorderSide(color: Colors.white38)),
                focusedBorder: UnderlineInputBorder(borderSide: BorderSide(color: Colors.white)),
              ),
            ),
            const SizedBox(height: 10),
            if (_forgotPasswordMessage.isNotEmpty)
              Text(
                _forgotPasswordMessage,
                style: TextStyle(
                  color: _forgotPasswordMessage.contains('sent') ? Colors.green : Colors.red,
                ),
              ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Cancel', style: TextStyle(color: Colors.white)),
          ),
          ElevatedButton(
            onPressed: _forgotPasswordLoading ? null : doForgotPassword,
            child: _forgotPasswordLoading
                ? const SizedBox(
              width: 18,
              height: 18,
              child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
            )
                : const Text('Send'),
          ),
        ],
      ),
    );
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
                const SizedBox(height: 40),
                const Center(
                  child: Text(
                    'Finstats',
                    style: TextStyle(
                      fontSize: 32,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                const SizedBox(height: 20),
                Lottie.asset(
                  'assets/graph_animation.json',
                  height: 200,
                  repeat: true,
                  animate: true,
                ),
                const SizedBox(height: 20),
                TextField(
                  controller: _usernameController,
                  style: const TextStyle(color: Colors.white),
                  decoration: const InputDecoration(
                    labelText: 'Username',
                    labelStyle: TextStyle(color: Colors.white70),
                    enabledBorder: UnderlineInputBorder(borderSide: BorderSide(color: Colors.white38)),
                    focusedBorder: UnderlineInputBorder(borderSide: BorderSide(color: Colors.white)),
                  ),
                ),
                const SizedBox(height: 10),
                TextField(
                  controller: _passwordController,
                  obscureText: true,
                  style: const TextStyle(color: Colors.white),
                  decoration: const InputDecoration(
                    labelText: 'Password',
                    labelStyle: TextStyle(color: Colors.white70),
                    enabledBorder: UnderlineInputBorder(borderSide: BorderSide(color: Colors.white38)),
                    focusedBorder: UnderlineInputBorder(borderSide: BorderSide(color: Colors.white)),
                  ),
                ),
                const SizedBox(height: 20),
                ElevatedButton(
                  onPressed: _loading ? null : doLogin,
                  child: _loading
                      ? const CircularProgressIndicator(color: Colors.black)
                      : const Text('Log In'),
                ),
                const SizedBox(height: 10),
                OutlinedButton(
                  onPressed: goToSignup,
                  child: const Text('Sign Up'),
                ),
                const SizedBox(height: 10),
                TextButton(
                  onPressed: showForgotPasswordDialog,
                  child: const Text('Forgot Password?', style: TextStyle(color: Colors.white)),
                ),
                const SizedBox(height: 20),
                Text(
                  _message,
                  textAlign: TextAlign.center,
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: _message.contains('incorrect') ? Colors.red : Colors.black87,
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
