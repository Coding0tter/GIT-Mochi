import { createSignal, onMount, Show } from "solid-js";
import logo from "../../assets/logo.svg";
import styles from "./setupWizard.module.css";
import Button from "../shared/Button/Button";
import { useNavigate } from "@solidjs/router";
import { settingsService } from "@client/services/settingsService";
import { addNotification } from "@client/services/notificationService";
import { loadGitLabProjectsAsync } from "@client/services/gitlabService";
import { setProjectAsync } from "@client/services/customProjectService";
import type { Project } from "@client/stores/uiStore";

enum SetupStep {
  Welcome = "welcome",
  GitLabConfig = "gitlab-config",
  UserVerification = "user-verification",
  ProjectSelection = "project-selection",
  Complete = "complete",
}

const SetupWizard = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = createSignal(SetupStep.Welcome);
  const [gitlabUrl, setGitlabUrl] = createSignal("");
  const [gitlabToken, setGitlabToken] = createSignal("");
  const [isValidating, setIsValidating] = createSignal(false);
  const [validatedUser, setValidatedUser] = createSignal<any>(null);
  const [selectedProject, setSelectedProject] = createSignal<string | null>(
    null,
  );
  const [searchQuery, setSearchQuery] = createSignal("");
  const [projects, setProjects] = createSignal<Project[]>([]);

  const validateGitLabConnection = async () => {
    if (!gitlabUrl() || !gitlabToken()) {
      addNotification({
        title: "Validation Failed",
        description: "Please enter both GitLab URL and token",
        type: "error",
      });
      return;
    }

    setIsValidating(true);
    try {
      const result = await settingsService.validateGitLabConnection(
        gitlabUrl(),
        gitlabToken(),
      );

      if (result.isValid) {
        setValidatedUser(result.user);
        // Save the config
        await settingsService.saveGitLabConfig(gitlabUrl(), gitlabToken());
        setCurrentStep(SetupStep.UserVerification);
      } else {
        addNotification({
          title: "Connection Failed",
          description: result.error || "Could not connect to GitLab",
          type: "error",
        });
      }
    } catch (error) {
      addNotification({
        title: "Error",
        description: "Failed to validate GitLab connection",
        type: "error",
      });
    } finally {
      setIsValidating(false);
    }
  };

  const getStepNumber = (step: SetupStep): number => {
    const steps = Object.values(SetupStep);
    return steps.indexOf(step) + 1;
  };

  const goBack = () => {
    const steps = Object.values(SetupStep);
    const currentIndex = steps.indexOf(currentStep());
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1] as SetupStep);
    }
  };

  const loadProjects = async () => {
    try {
      const gitlabProjects = await loadGitLabProjectsAsync();
      setProjects(gitlabProjects);
      setCurrentStep(SetupStep.ProjectSelection);
    } catch (error) {
      addNotification({
        title: "Error",
        description: "Failed to load projects",
        type: "error",
      });
    }
  };

  const completeSetup = async () => {
    try {
      if (!selectedProject()) {
        addNotification({
          title: "Project Selection Required",
          description: "Please select a project to continue.",
        });
      }

      await setProjectAsync(selectedProject()!);
      await settingsService.completeSetup();
      setCurrentStep(SetupStep.Complete);

      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (error) {
      addNotification({
        title: "Error",
        description: "Failed to complete setup",
        type: "error",
      });
    }
  };

  return (
    <div class={styles.setupWizard}>
      <div class={styles.header}>
        <img src={logo} alt="Mochi Logo" class={styles.logo} />
        <h1>Welcome to Mochi</h1>
        <div class={styles.progress}>
          <div
            class={styles.progressBar}
            style={{ width: `${(getStepNumber(currentStep()) / 5) * 100}%` }}
          />
        </div>
      </div>
      <div class={styles.content}>
        <Show when={currentStep() === SetupStep.Welcome}>
          <div class={styles.welcomeStep}>
            <h2>Let's get you started</h2>
            <p>
              Mochi is a keyboard-friendly, GitLab-integrated Kanban board that
              makes task management efficient and intuitive.
            </p>
            <div class={styles.features}>
              <div class={styles.feature}>
                <i class="fa-solid fa-keyboard"></i>
                <span>Vim-motions keyboard shortcuts</span>
              </div>
              <div class={styles.feature}>
                <i class="fa-brands fa-gitlab"></i>
                <span>GitLab integration</span>
              </div>
            </div>
            <Button
              type="primary"
              onClick={() => setCurrentStep(SetupStep.GitLabConfig)}
            >
              Get Started
            </Button>
          </div>
        </Show>

        <Show when={currentStep() === SetupStep.GitLabConfig}>
          <div class={styles.configStep}>
            <h2>Connect to GitLab</h2>
            <p>Enter your GitLab instance URL and personal access token.</p>

            <div class={styles.form}>
              <div class={styles.formGroup}>
                <label>GitLab URL</label>
                <input
                  type="url"
                  placeholder="https://gitlab.com"
                  value={gitlabUrl()}
                  onInput={(e) => setGitlabUrl(e.currentTarget.value)}
                />
              </div>

              <div class={styles.formGroup}>
                <label>Personal Access Token</label>
                <input
                  type="password"
                  placeholder="glpat-xxxxxxxxxxxxxxxxxxxx"
                  value={gitlabToken()}
                  onInput={(e) => setGitlabToken(e.currentTarget.value)}
                />
                <small>
                  Need a token?
                  <a
                    href={`${gitlabUrl() || "https://gitlab.com"}/-/user_settings/personal_access_tokens`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Create one here
                  </a>{" "}
                  with 'api' and 'read_user' scopes.
                </small>
              </div>
            </div>

            <div class={styles.actions}>
              <Button type="secondary" onClick={goBack}>
                Back
              </Button>
              <Button
                type="primary"
                onClick={validateGitLabConnection}
                disabled={isValidating()}
              >
                {isValidating() ? "Validating..." : "Test Connection"}
              </Button>
            </div>
          </div>
        </Show>

        <Show when={currentStep() === SetupStep.UserVerification}>
          <div class={styles.userStep}>
            <h2>Confirm Your Account</h2>
            <div class={styles.userCard}>
              <img
                src={
                  validatedUser()?.avatar_url ||
                  `https://avatar.vercel.sh/${validatedUser()?.username}`
                }
                alt="User avatar"
                class={styles.userAvatar}
              />
              <div class={styles.userInfo}>
                <h3>{validatedUser()?.name}</h3>
                <p>@{validatedUser()?.username}</p>
                <p>{validatedUser()?.email}</p>
              </div>
            </div>
            <p>Is this the correct GitLab account?</p>

            <div class={styles.actions}>
              <Button
                type="secondary"
                onClick={() => setCurrentStep(SetupStep.GitLabConfig)}
              >
                No, go back
              </Button>
              <Button type="primary" onClick={loadProjects}>
                Yes, continue
              </Button>
            </div>
          </div>
        </Show>

        <Show when={currentStep() === SetupStep.ProjectSelection}>
          <div class={styles.projectStep}>
            <h2>Select a Default Project</h2>
            <p>Choose a project to start with.</p>

            <div class={styles.formGroup}>
              <input
                class={styles.searchInput}
                type="text"
                placeholder="Search projects by name or ID"
                value={searchQuery()}
                onInput={(e) => setSearchQuery(e.currentTarget.value)}
              />
            </div>

            <div class={styles.divider} />

            <div class={styles.projectList}>
              {projects()
                .filter(
                  (item) =>
                    item.name_with_namespace
                      ?.toLowerCase()
                      .includes(searchQuery().toLowerCase()) ||
                    item.id.toString().includes(searchQuery()),
                )
                .map((project) => (
                  <div
                    class={`${styles.projectOption} ${selectedProject() === project.id ? styles.selected : ""}`}
                    onClick={() => setSelectedProject(project.id)}
                  >
                    <i class="fa-solid fa-folder"></i>
                    <div>
                      <strong>
                        {project.id} - {project.name_with_namespace}
                      </strong>
                      {project.description && (
                        <small>{project.description}</small>
                      )}
                    </div>
                  </div>
                ))}
            </div>

            <div class={styles.actions}>
              <Button type="secondary" onClick={goBack}>
                Back
              </Button>
              <Button type="primary" onClick={completeSetup}>
                Complete Setup
              </Button>
            </div>
          </div>
        </Show>

        <Show when={currentStep() === SetupStep.Complete}>
          <div class={styles.completeStep}>
            <div class={styles.successIcon}>
              <i class="fa-solid fa-check-circle"></i>
            </div>
            <h2>Setup Complete!</h2>
            <p>You're all set! Redirecting to your dashboard...</p>
          </div>
        </Show>
      </div>

      <div class={styles.footer}>
        <p>
          Need help? Check out the
          <a href="https://github.com/Coding0tter/GIT-Mochi" target="_blank">
            {" "}
            documentation
          </a>
        </p>
      </div>
    </div>
  );
};

export default SetupWizard;
