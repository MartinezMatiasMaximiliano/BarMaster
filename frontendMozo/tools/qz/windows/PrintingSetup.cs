using System;
using System.ComponentModel;
using System.Diagnostics;
using System.Drawing;
using System.IO;
using System.Reflection;
using System.Threading.Tasks;
using System.Windows.Forms;

internal static class PrintingSetup
{
    [STAThread]
    private static int Main(string[] args)
    {
        // La fase elevada extrae sus propios recursos; nunca ejecuta scripts recibidos por URL.
        if (args.Length == 1 && (args[0] == "--install" || args[0] == "--verify"))
            return RunPackage(args[0] == "--verify");
        Application.EnableVisualStyles();
        Application.SetCompatibleTextRenderingDefault(false);
        // Renderiza el diálogo para revisión visual sin instalar ni solicitar elevación.
        if (args.Length == 2 && args[0] == "--preview")
        {
            using (var window = new SetupWindow())
            using (var bitmap = new Bitmap(window.Width, window.Height))
            {
                window.StartPosition = FormStartPosition.Manual;
                window.Location = new Point(-32000, -32000);
                window.ShowInTaskbar = false;
                window.Show();
                Application.DoEvents();
                window.DrawToBitmap(bitmap, new Rectangle(Point.Empty, window.Size));
                bitmap.Save(args[1], System.Drawing.Imaging.ImageFormat.Png);
            }
            return 0;
        }
        Application.Run(new SetupWindow());
        return 0;
    }

    private static int RunPackage(bool verify)
    {
        string directory = Path.Combine(Path.GetTempPath(), "BarMaster-Qz-" + Guid.NewGuid().ToString("N"));
        Directory.CreateDirectory(Path.Combine(directory, "public"));
        string log = Path.Combine(directory, "instalacion.log");
        try
        {
            // Comprobar también los recursos visuales incluidos en el binario final.
            using (Stream icon = Assembly.GetExecutingAssembly().GetManifestResourceStream("barmaster.ico"))
            using (var decodedIcon = new Icon(icon))
            using (Stream logo = Assembly.GetExecutingAssembly().GetManifestResourceStream("logo_completo.png"))
            using (var decodedLogo = Image.FromStream(logo)) { }
            string[] resources = { "Setup-Impresion.ps1", "Install-BarMasterQz.ps1", "QzWindows.Common.psm1", "qz-manifest.json", "override.crt" };
            foreach (string name in resources)
            {
                string target = Path.Combine(directory, name == "override.crt" ? "public\\override.crt" : name);
                using (Stream input = Assembly.GetExecutingAssembly().GetManifestResourceStream(name))
                using (Stream output = File.Create(target))
                {
                    if (input == null) throw new InvalidOperationException("Falta el recurso " + name);
                    input.CopyTo(output);
                }
            }
            var start = new ProcessStartInfo
            {
                FileName = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.System), "WindowsPowerShell\\v1.0\\powershell.exe"),
                Arguments = "-NoProfile -NonInteractive -ExecutionPolicy Bypass -File \"" + Path.Combine(directory, "Setup-Impresion.ps1") + "\"" + (verify ? " -VerifyOnly" : ""),
                UseShellExecute = false,
                CreateNoWindow = true,
                RedirectStandardOutput = true,
                RedirectStandardError = true
            };
            start.EnvironmentVariables.Remove("PSModulePath");
            using (Process process = Process.Start(start))
            {
                Task<string> output = process.StandardOutput.ReadToEndAsync();
                Task<string> error = process.StandardError.ReadToEndAsync();
                process.WaitForExit();
                File.WriteAllText(log, output.Result + Environment.NewLine + error.Result);
                if (process.ExitCode != 0 && !verify)
                    MessageBox.Show("No se pudo completar la instalación.\n\n" + output.Result + "\n" + error.Result + "\nRegistro: " + log,
                        "BarMaster", MessageBoxButtons.OK, MessageBoxIcon.Error);
                return process.ExitCode;
            }
        }
        catch (Exception error)
        {
            File.WriteAllText(log, error.ToString());
            if (!verify) MessageBox.Show(error.Message + "\nRegistro: " + log, "BarMaster", MessageBoxButtons.OK, MessageBoxIcon.Error);
            return 1;
        }
    }

    private sealed class SetupWindow : Form
    {
        private readonly Label status;
        private readonly Button install;
        private readonly ProgressBar progress;
        private readonly PictureBox brand;
        private bool running;

        public SetupWindow()
        {
            Text = "BarMaster · Configurar impresión";
            ClientSize = new Size(580, 385);
            BackColor = Color.White;
            StartPosition = FormStartPosition.CenterScreen;
            FormBorderStyle = FormBorderStyle.FixedDialog;
            MaximizeBox = false;
            Font = new Font("Segoe UI", 10);
            using (Stream icon = Assembly.GetExecutingAssembly().GetManifestResourceStream("barmaster.ico"))
            using (var sourceIcon = new Icon(icon)) { Icon = (Icon)sourceIcon.Clone(); }
            brand = new PictureBox { Location = new Point(24, 18), Size = new Size(260, 99), SizeMode = PictureBoxSizeMode.Zoom, TabStop = false };
            using (Stream logo = Assembly.GetExecutingAssembly().GetManifestResourceStream("logo_completo.png"))
            using (var sourceLogo = Image.FromStream(logo)) { brand.Image = new Bitmap(sourceLogo); }
            Controls.Add(brand);
            Controls.Add(new Label { Text = "Preparar este equipo para imprimir", Font = new Font("Segoe UI", 16, FontStyle.Bold), AutoSize = true, Location = new Point(24, 133) });
            status = new Label { Text = "Instala QZ Tray y configura el certificado de BarMaster.\nNecesita Internet para instalar o actualizar QZ.\nWindows pedirá permiso de administrador. QZ se reiniciará;\nejecutá este paso cuando no haya impresiones en curso.", Location = new Point(24, 182), Size = new Size(532, 102) };
            progress = new ProgressBar { Location = new Point(24, 299), Size = new Size(532, 12), Visible = false, Style = ProgressBarStyle.Marquee };
            install = new Button { Text = "Instalar y configurar", Location = new Point(350, 327), Size = new Size(206, 36) };
            install.Click += Install;
            Controls.Add(status);
            Controls.Add(progress);
            Controls.Add(install);
            FormClosing += delegate(object sender, FormClosingEventArgs e) { if (running) e.Cancel = true; };
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing) { if (brand != null && brand.Image != null) brand.Image.Dispose(); if (Icon != null) Icon.Dispose(); }
            base.Dispose(disposing);
        }

        private async void Install(object sender, EventArgs e)
        {
            running = true;
            install.Enabled = false;
            progress.Visible = true;
            status.Text = "Instalando y configurando…\nAceptá el permiso de Windows para continuar.\nLa descarga puede tardar varios minutos.";
            try
            {
                int code = await Task.Run(() =>
                {
                    using (Process process = Process.Start(new ProcessStartInfo
                    {
                        FileName = Application.ExecutablePath,
                        Arguments = "--install",
                        Verb = "runas",
                        UseShellExecute = true,
                        WindowStyle = ProcessWindowStyle.Hidden
                    }))
                    {
                        process.WaitForExit();
                        return process.ExitCode;
                    }
                });
                if (code != 0) throw new InvalidOperationException("La instalación no se completó. Revisá el mensaje de error y volvé a intentar.");
                // Este proceso conserva el usuario original, aunque UAC use otra cuenta administradora.
                string qz = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles), "QZ Tray\\qz-tray.exe");
                Process.Start(new ProcessStartInfo { FileName = qz, WorkingDirectory = Path.GetDirectoryName(qz), UseShellExecute = false, CreateNoWindow = true, WindowStyle = ProcessWindowStyle.Hidden });
                status.Text = "Listo. QZ Tray está configurado y se está iniciando.\nVolvé a BarMaster y presioná Buscar para detectar\nlas impresoras de este equipo.";
                install.Text = "Cerrar";
                install.Click -= Install;
                install.Click += delegate { Close(); };
            }
            catch (Win32Exception error)
            {
                status.Text = error.NativeErrorCode == 1223
                    ? "Se canceló el permiso de administrador.\nPodés volver a intentar cuando quieras."
                    : "No se pudo completar la configuración:\n" + error.Message;
            }
            catch (Exception error) { status.Text = error.Message; }
            finally { running = false; install.Enabled = true; progress.Visible = false; }
        }
    }
}
